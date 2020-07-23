use chrono::{DateTime, Utc};

#[derive(Debug, Clone, PartialEq)]
pub enum ContractStatus {
    Requested,
    Approved,
    Rejected,
    Cancelled,
}
