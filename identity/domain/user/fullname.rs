use common::error::Error;
use common::result::Result;

#[derive(Debug, Clone)]
pub struct Fullname {
    name: String,
    lastname: String,
}

impl Fullname {
    pub fn new(name: &str, lastname: &str) -> Result<Fullname> {
        let mut err = Error::application();

        if name.len() < 4 {
            err.add_context("name", "too_short");
        }

        if name.len() > 64 {
            err.add_context("name", "too_long");
        }

        if lastname.len() < 4 {
            err.add_context("lastname", "too_short");
        }

        if lastname.len() > 64 {
            err.add_context("lastname", "too_long");
        }

        if err.has_context() {
            return Err(err);
        }

        Ok(Fullname {
            name: String::from(name),
            lastname: String::from(lastname),
        })
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn lastname(&self) -> &str {
        &self.lastname
    }
}