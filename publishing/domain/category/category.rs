use common::event::BasicEvent;
use common::model::AggregateRoot;
use common::result::Result;

#[derive(Debug, Clone)]
pub struct Name {
    name: String,
}

impl Name {
    pub fn new(name: &str) -> Result<Name> {
        Ok(Name {
            name: name.to_owned(),
        })
    }

    pub fn value(&self) -> &str {
        &self.name
    }
}

pub type CategoryId = String;

#[derive(Debug, Clone)]
pub struct Category {
    base: AggregateRoot<CategoryId, BasicEvent>,
    name: Name,
}

impl Category {
    pub fn new(id: CategoryId, name: Name) -> Result<Category> {
        Ok(Category {
            base: AggregateRoot::new(id),
            name,
        })
    }

    pub fn name(&self) -> &Name {
        &self.name
    }
}