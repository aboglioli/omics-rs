use serde::{Deserialize, Serialize};

use common::error::Error;
use common::event::EventPublisher;
use common::result::Result;

use crate::domain::role::RoleRepository;
use crate::domain::user::AuthenticationService;

#[derive(Deserialize)]
pub struct LoginCommand {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    user_id: String,
    auth_token: String,
}

pub struct Login<'a> {
    event_pub: &'a dyn EventPublisher,

    role_repo: &'a dyn RoleRepository,

    authentication_serv: &'a AuthenticationService,
}

impl<'a> Login<'a> {
    pub fn new(
        event_pub: &'a dyn EventPublisher,
        role_repo: &'a dyn RoleRepository,
        authentication_serv: &'a AuthenticationService,
    ) -> Self {
        Login {
            event_pub,
            role_repo,
            authentication_serv,
        }
    }

    pub async fn exec(&self, cmd: LoginCommand) -> Result<LoginResponse> {
        match self
            .authentication_serv
            .authenticate(&cmd.username, &cmd.password)
            .await
        {
            Ok((user, token)) => {
                self.event_pub.publish_all(user.events().to_vec()?).await?;

                let role = self.role_repo.find_by_user_id(user.base().id()).await?;
                if !role.can("login") {
                    return Err(Error::unauthorized());
                }

                Ok(LoginResponse {
                    user_id: user.base().id().to_string(),
                    auth_token: token.to_string(),
                })
            }
            Err(e) => Err(e),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use crate::mocks;

    #[tokio::test]
    async fn not_validated_user() {
        let c = mocks::container();
        let uc = Login::new(c.event_pub(), c.role_repo(), c.authentication_serv());

        let mut user = mocks::user(
            "user-1",
            "username",
            "user@omics.com",
            "P@asswd!",
            false,
            None,
            None,
            "user",
        );
        c.user_repo().save(&mut user).await.unwrap();

        assert!(uc
            .exec(LoginCommand {
                username: user.identity().username().to_string(),
                password: "P@asswd!".to_owned(),
            })
            .await
            .is_err());
    }

    #[tokio::test]
    async fn validated_user() {
        let c = mocks::container();
        let uc = Login::new(c.event_pub(), c.role_repo(), c.authentication_serv());

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

        let res = uc
            .exec(LoginCommand {
                username: user.identity().username().to_string(),
                password: "P@asswd!".to_owned(),
            })
            .await
            .unwrap();
        assert!(!res.auth_token.is_empty());
        assert_eq!(c.event_pub().events().await.len(), 1);

        assert!(uc
            .exec(LoginCommand {
                username: "non-existing".to_owned(),
                password: "P@asswd!".to_owned(),
            })
            .await
            .is_err());

        assert!(uc
            .exec(LoginCommand {
                username: user.identity().username().to_string(),
                password: "invalid".to_owned(),
            })
            .await
            .is_err());
    }
}
