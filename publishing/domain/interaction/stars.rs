use common::error::Error;
use common::result::Result;

pub struct Stars {
    stars: u8,
}

impl Stars {
    pub fn new(stars: u8) -> Result<Stars> {
        if stars > 5 {
            return Err(Error::pair("stars", "invalid_range"));
        }

        Ok(Stars { stars })
    }

    pub fn value(&self) -> u8 {
        self.stars
    }
}