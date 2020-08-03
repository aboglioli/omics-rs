use async_trait::async_trait;

use common::result::Result;

use crate::domain::user::{User, UserId};

#[async_trait]
pub trait UserRepository {
    async fn find_by_id(&self, id: &UserId) -> Result<User>;
}