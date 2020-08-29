use actix_web::{web, HttpRequest, HttpResponse, Responder};

use common::request::IncludeParams;
use identity::application::role::{GetAll, GetById};

use crate::authorization::auth;
use crate::container::Container;
use crate::error::PublicError;

async fn get_all(req: HttpRequest, c: web::Data<Container>) -> impl Responder {
    let auth_id = auth(&req, &c).await?;

    GetAll::new(c.identity.role_repo(), c.identity.user_repo())
        .exec(auth_id)
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

async fn get_by_id(
    req: HttpRequest,
    path: web::Path<String>,
    include: web::Query<IncludeParams>,
    c: web::Data<Container>,
) -> impl Responder {
    let auth_id = auth(&req, &c).await?;

    GetById::new(c.identity.role_repo(), c.identity.user_repo())
        .exec(auth_id, path.into_inner(), include.into_inner().into())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/roles")
            .route("", web::get().to(get_all))
            .route("/{role_id}", web::get().to(get_by_id)),
    );
}
