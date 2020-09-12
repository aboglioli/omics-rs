use serde::{Deserialize, Serialize};

use common::error::Error;
use common::request::Include;
use common::result::Result;

use crate::application::dtos::{RoleDto, UserDto};
use crate::domain::role::{RoleId, RoleRepository};
use crate::domain::user::{UserId, UserRepository};

#[derive(Deserialize)]
pub struct SearchCommand {
    pub role_id: Option<String>,
}

#[derive(Serialize)]
pub struct SearchResponse {
    users: Vec<UserDto>,
}

pub struct Search<'a> {
    role_repo: &'a dyn RoleRepository,
    user_repo: &'a dyn UserRepository,
}

impl<'a> Search<'a> {
    pub fn new(role_repo: &'a dyn RoleRepository, user_repo: &'a dyn UserRepository) -> Self {
        Search {
            role_repo,
            user_repo,
        }
    }

    pub async fn exec(
        &self,
        auth_id: String,
        cmd: SearchCommand,
        include: Include,
    ) -> Result<SearchResponse> {
        let user = self.user_repo.find_by_id(&UserId::new(auth_id)?).await?;
        if !user.is_admin() {
            return Err(Error::unauthorized());
        }

        let mut users = Vec::new();

        if cmd.role_id.is_none() {
            users.extend(self.user_repo.find_all().await?);
        } else if let Some(role_id) = cmd.role_id {
            users.extend(
                self.user_repo
                    .find_by_role_id(&RoleId::new(role_id)?)
                    .await?,
            );
        }

        let mut user_dtos = Vec::new();

        for user in users.iter() {
            let mut user_dto = UserDto::from(user);

            if include.has("role") {
                let role = self.role_repo.find_by_id(user.role_id()).await?;
                user_dto = user_dto.role(RoleDto::from(&role));
            }

            user_dtos.push(user_dto);
        }

        Ok(SearchResponse { users: user_dtos })
    }
}
