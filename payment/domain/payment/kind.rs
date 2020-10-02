use std::str::FromStr;

use common::error::Error;
use common::result::Result;

#[derive(Debug, Clone)]
pub enum Kind {
    Income,
    Outcome,
    Transfer,
}

impl ToString for Kind {
    fn to_string(&self) -> String {
        match self {
            Kind::Income => "income".to_owned(),
            Kind::Outcome => "outcome".to_owned(),
            Kind::Transfer => "transfer".to_owned(),
        }
    }
}

impl FromStr for Kind {
    type Err = Error;
    fn from_str(s: &str) -> Result<Self> {
        match s {
            "income" => Ok(Kind::Income),
            "outcome" => Ok(Kind::Outcome),
            "transfer" => Ok(Kind::Transfer),
            _ => Err(Error::not_found("kind")),
        }
    }
}
