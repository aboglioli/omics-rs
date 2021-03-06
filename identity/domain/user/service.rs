use std::sync::Arc;

use common::error::Error;
use common::result::Result;

use crate::domain::user::{Email, Password, PasswordHasher, User, UserRepository, Username};

pub struct UserService {
    user_repo: Arc<dyn UserRepository>,

    password_hasher: Arc<dyn PasswordHasher>,
}

impl UserService {
    pub fn new(
        user_repo: Arc<dyn UserRepository>,
        password_hasher: Arc<dyn PasswordHasher>,
    ) -> Self {
        UserService {
            user_repo,
            password_hasher,
        }
    }

    pub async fn available(&self, username: &str, email: &str) -> Result<bool> {
        let mut err = Error::new("identity", "invalid");
        if self
            .user_repo
            .find_by_username(&Username::new(username)?)
            .await
            .is_ok()
        {
            err = err.add_context("username", "not_available");
        }
        if self
            .user_repo
            .find_by_email(&Email::new(email)?)
            .await
            .is_ok()
        {
            err = err.add_context("email", "not_available");
        }

        if err.has_context() {
            return Err(err);
        }

        Ok(true)
    }

    pub async fn change_password(
        &self,
        user: &mut User,
        old_password: &str,
        new_password: &str,
    ) -> Result<()> {
        if old_password == new_password {
            return Err(Error::new("passwords", "are_the_same"));
        }

        let user_password = match user.identity().password() {
            Some(password) => password.value(),
            None => return Err(Error::new("password", "unavailable")),
        };

        if !self.password_hasher.compare(user_password, old_password) {
            return Err(Error::new("password", "invalid"));
        }

        let hashed_password = self.generate_password(new_password)?;

        let password = Password::new(&hashed_password)?;
        user.set_password(password)?;

        Ok(())
    }

    pub fn generate_password(&self, plain_password: &str) -> Result<String> {
        // TODO: improve validation
        if plain_password.len() < 8 {
            return Err(Error::new("password", "too_short"));
        }

        self.password_hasher.hash(plain_password)
    }
}

#[cfg(test)]
mod tests {
    use crate::mocks;

    #[tokio::test]
    async fn check_availability() {
        let c = mocks::container();
        let serv = c.user_serv();

        let mut user = mocks::user(
            "user-1",
            "username",
            "user@omics.com",
            "P@asswd!",
            true,
            None,
            None,
            "user",
        );
        c.user_repo().save(&mut user).await.unwrap();

        assert!(serv
            .available(
                user.identity().username().value(),
                user.identity().email().value()
            )
            .await
            .is_err());
        assert!(serv
            .available(user.identity().username().value(), "new@email.com")
            .await
            .is_err());
        assert!(serv
            .available("new-user", user.identity().email().value())
            .await
            .is_err());
        assert!(serv.available("new-user", "new@email.com").await.is_ok());
    }

    #[tokio::test]
    async fn change_password() {
        let c = mocks::container();
        let serv = c.user_serv();

        let mut user = mocks::user(
            "user-1",
            "username",
            "user@omics.com",
            "P@asswd!",
            true,
            None,
            None,
            "user",
        );
        c.user_repo().save(&mut user).await.unwrap();

        assert!(serv
            .change_password(&mut user, "P@asswd!", "123")
            .await
            .is_err());
        assert!(serv
            .change_password(&mut user, "invalid-password", "New_P@asswd!")
            .await
            .is_err());
        assert!(serv
            .change_password(&mut user, "P@asswd!", "New_P@asswd!")
            .await
            .is_ok());
        assert!(serv
            .change_password(&mut user, "New_P@asswd!", "new-password")
            .await
            .is_ok());
    }

    #[test]
    fn generate_password() {
        let c = mocks::container();
        let serv = c.user_serv();

        assert!(serv.generate_password("123").is_err());
        assert!(serv.generate_password("abc123").is_err());
        assert!(serv.generate_password("P@asswd!").is_ok());
    }
}
