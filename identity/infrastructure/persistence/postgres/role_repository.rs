use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use tokio_postgres::row::Row;
use tokio_postgres::Client;
use uuid::Uuid;

use common::error::Error;
use common::model::AggregateRoot;
use common::result::Result;

use crate::domain::role::{Role, RoleId, RoleRepository};

impl Role {
    fn from_row(row: Row) -> Result<Self> {
        let id: Uuid = row.get("id");
        let name: String = row.get("name");

        let created_at: DateTime<Utc> = row.get("created_at");

        Ok(Role::build(
            AggregateRoot::build(RoleId::new(id.to_string())?, created_at, None, None),
            name,
        ))
    }
}

pub struct PostgresRoleRepository {
    client: Arc<Client>,
}

impl PostgresRoleRepository {
    pub fn new(client: Arc<Client>) -> Self {
        PostgresRoleRepository { client }
    }
}

#[async_trait]
impl RoleRepository for PostgresRoleRepository {
    async fn find_all(&self) -> Result<Vec<Role>> {
        let rows = self
            .client
            .query("SELECT * FROM roles", &[])
            .await
            .map_err(|err| Error::not_found("role").wrap_raw(err))?;

        let mut users = Vec::new();

        for row in rows.into_iter() {
            users.push(Role::from_row(row)?);
        }

        Ok(users)
    }

    async fn find_by_id(&self, id: &RoleId) -> Result<Role> {
        let row = self
            .client
            .query_one("SELECT * FROM roles WHERE id = $1", &[&id.value()])
            .await
            .map_err(|err| Error::not_found("role").wrap_raw(err))?;

        Role::from_row(row)
    }

    async fn save(&self, role: &mut Role) -> Result<()> {
        let create = self
            .client
            .query_one(
                "SELECT * FROM roles WHERE id = $1",
                &[&role.base().id().value()],
            )
            .await
            .is_err();

        if create {
            self.client
                .execute(
                    "INSERT INTO roles(id, name, created_at)
                    VALUES ($1, $2, $3)",
                    &[
                        &role.base().id().value(),
                        &role.name(),
                        &role.base().created_at(),
                    ],
                )
                .await
                .map_err(|err| Error::new("role", "create").wrap_raw(err))?;
        } else {
            self.client
                .execute(
                    "UPDATE roles
                    SET
                        name = $2
                    WHERE
                        id = $1",
                    &[&role.base().id().value(), &role.name()],
                )
                .await
                .map_err(|err| Error::new("role", "update").wrap_raw(err))?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {

    #[tokio::test]
    async fn all() {}
}