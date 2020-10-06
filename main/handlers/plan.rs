use actix_web::{delete, get, post, put, web, HttpRequest, HttpResponse, Responder};

use payment::application::plan::{Create, Delete, GetAll, Update};

use crate::authorization::auth;
use crate::container::MainContainer;
use crate::error::PublicError;

#[get("")]
async fn get_all(c: web::Data<MainContainer>) -> impl Responder {
    GetAll::new(c.payment.plan_repo())
        .exec(auth_id)
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[get("/{category_id}")]
async fn get_by_id(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let auth_id = auth(&req, &c).await.ok();

    GetById::new(c.publishing.category_repo())
        .exec(auth_id, path.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[get("/{category_id}/publications")]
async fn get_publications(
    req: HttpRequest,
    path: web::Path<String>,
    include: web::Query<IncludeParams>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let auth_id = auth(&req, &c).await.ok();

    SearchPublication::new(
        c.publishing.author_repo(),
        c.publishing.category_repo(),
        c.publishing.publication_repo(),
        c.publishing.user_repo(),
    )
    .exec(
        auth_id,
        SearchPublicationCommand {
            author_id: None,
            category_id: Some(path.into_inner()),
            tag: None,
            status: None,
            name: None,
        },
        include.into_inner().into(),
    )
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[get("/{category_id}/collections")]
async fn get_collections(
    req: HttpRequest,
    path: web::Path<String>,
    include: web::Query<IncludeParams>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let auth_id = auth(&req, &c).await.ok();

    SearchCollection::new(
        c.publishing.author_repo(),
        c.publishing.category_repo(),
        c.publishing.collection_repo(),
    )
    .exec(
        auth_id,
        SearchCollectionCommand {
            author_id: None,
            category_id: Some(path.into_inner()),
            publication_id: None,
            tag: None,
            name: None,
        },
        include.into_inner().into(),
    )
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[post("")]
async fn create(
    req: HttpRequest,
    cmd: web::Json<CreateCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let auth_id = auth(&req, &c).await?;

    Create::new(
        c.publishing.event_pub(),
        c.publishing.category_repo(),
        c.publishing.user_repo(),
    )
    .exec(auth_id, cmd.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[put("/{category_id}")]
async fn update(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Json<UpdateCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let auth_id = auth(&req, &c).await?;

    Update::new(
        c.publishing.event_pub(),
        c.publishing.category_repo(),
        c.publishing.user_repo(),
    )
    .exec(auth_id, path.into_inner(), cmd.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[delete("/{category_id}")]
async fn delete(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let auth_id = auth(&req, &c).await?;

    Delete::new(
        c.publishing.event_pub(),
        c.publishing.category_repo(),
        c.publishing.user_repo(),
    )
    .exec(auth_id, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/categories")
            .service(get_all)
            .service(get_by_id)
            .service(get_publications)
            .service(get_collections)
            .service(create)
            .service(update)
            .service(delete),
    );
}