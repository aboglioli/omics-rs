use serde::Serialize;

use common::error::Error;
use common::result::Result;

use crate::application::dtos::RoleDto;
use crate::domain::role::RoleRepository;
use crate::domain::user::{UserId, UserRepository};

#[derive(Serialize)]
pub struct GetAllResponse {
    pub roles: Vec<RoleDto>,
}

pub struct GetAll<'a> {
    role_repo: &'a dyn RoleRepository,
    user_repo: &'a dyn UserRepository,
}

impl<'a> GetAll<'a> {
    pub fn new(role_repo: &'a dyn RoleRepository, user_repo: &'a dyn UserRepository) -> Self {
        GetAll {
            role_repo,
            user_repo,
        }
    }

    pub async fn exec(&self, auth_id: String) -> Result<GetAllResponse> {
        let role = self.role_repo.find_by_user_id(&UserId::new(auth_id)?).await?;
        if !role.can("get_all_roles") {
            return Err(Error::unauthorized());
        }

        let roles = self.role_repo.find_all().await?;

        Ok(GetAllResponse {
            roles: roles.iter().map(RoleDto::from).collect(),
        })
    }
}
