use actix_web::{delete, get, post, put, web, HttpRequest, HttpResponse, Responder};

use common::request::{IncludeParams, PaginationParams};
use payment::application::contract::{
    CanRequest as CanRequestContract, GenerateSummariesForPublication,
    GetByPublication as GetContractByPublication, Request as RequestContract,
};
use publishing::application::collection::{
    Search as SearchCollection, SearchCommand as SearchCollectionCommand,
};
use publishing::application::publication::{
    AddReview, AddReviewCommand, AddToFavorites, Approve, ApproveCommand, Create, CreateCommand,
    Delete, DeleteReview, GetById, GetReviews, GetStatistics, GetStatisticsCommand, Like, Publish,
    Read, Reject, RejectCommand, RemoveFromFavorites, Search, SearchCommand, Unlike, Update,
    UpdateCommand, UpdatePages, UpdatePagesCommand,
};

use crate::authorization::auth;
use crate::container::MainContainer;
use crate::error::PublicError;

#[post("")]
async fn create(
    req: HttpRequest,
    cmd: web::Json<CreateCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Create::new(
        c.publishing.event_pub(),
        c.publishing.author_repo(),
        c.publishing.category_repo(),
        c.publishing.publication_repo(),
    )
    .exec(user_id_and_role, cmd.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[get("")]
async fn search(
    req: HttpRequest,
    cmd: web::Query<SearchCommand>,
    include: web::Query<IncludeParams>,
    pagination: web::Query<PaginationParams>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await.ok();

    Search::new(
        c.publishing.author_repo(),
        c.publishing.category_repo(),
        c.publishing.publication_repo(),
    )
    .exec(
        user_id_and_role,
        cmd.into_inner(),
        include.into_inner().into(),
        pagination.into_inner(),
    )
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[get("/{publication_id}")]
async fn get_by_id(
    req: HttpRequest,
    path: web::Path<String>,
    include: web::Query<IncludeParams>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await.ok();

    GetById::new(
        c.publishing.event_pub(),
        c.publishing.author_repo(),
        c.publishing.category_repo(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
        c.publishing.statistics_serv(),
    )
    .exec(
        user_id_and_role,
        path.into_inner(),
        include.into_inner().into(),
    )
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[put("/{publication_id}")]
async fn update(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Json<UpdateCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Update::new(
        c.publishing.event_pub(),
        c.publishing.category_repo(),
        c.publishing.publication_repo(),
    )
    .exec(user_id_and_role, path.into_inner(), cmd.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[put("/{publication_id}/pages")]
async fn update_pages(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Json<UpdatePagesCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    UpdatePages::new(c.publishing.event_pub(), c.publishing.publication_repo())
        .exec(user_id_and_role, path.into_inner(), cmd.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[delete("/{publication_id}")]
async fn delete(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Delete::new(c.publishing.event_pub(), c.publishing.publication_repo())
        .exec(user_id_and_role, path.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[post("/{publication_id}/publish")]
async fn publish(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Publish::new(
        c.publishing.event_pub(),
        c.publishing.author_repo(),
        c.publishing.publication_repo(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[post("/{publication_id}/approve")]
async fn approve(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Json<ApproveCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Approve::new(c.publishing.event_pub(), c.publishing.publication_repo())
        .exec(user_id_and_role, path.into_inner(), cmd.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[post("/{publication_id}/reject")]
async fn reject(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Json<RejectCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Reject::new(c.publishing.event_pub(), c.publishing.publication_repo())
        .exec(user_id_and_role, path.into_inner(), cmd.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[get("/{publication_id}/read")]
async fn read(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Read::new(
        c.publishing.event_pub(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[post("/{publication_id}/like")]
async fn like(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Like::new(
        c.publishing.event_pub(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[post("/{publication_id}/unlike")]
async fn unlike(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    Unlike::new(
        c.publishing.event_pub(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[post("/{publication_id}/review")]
async fn review(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Json<AddReviewCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    AddReview::new(
        c.publishing.event_pub(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
    )
    .exec(user_id_and_role, path.into_inner(), cmd.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[delete("/{publication_id}/review")]
async fn delete_review(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    DeleteReview::new(
        c.publishing.event_pub(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[get("/{publication_id}/reviews")]
async fn get_reviews(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await.ok();

    GetReviews::new(c.publishing.interaction_repo(), c.publishing.reader_repo())
        .exec(user_id_and_role, path.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[get("/{publication_id}/collections")]
async fn get_collections(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Query<SearchCollectionCommand>,
    include: web::Query<IncludeParams>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await.ok();

    let mut cmd = cmd.into_inner();
    cmd.publication_id = Some(path.into_inner());

    SearchCollection::new(
        c.publishing.author_repo(),
        c.publishing.category_repo(),
        c.publishing.collection_repo(),
    )
    .exec(
        user_id_and_role,
        cmd,
        include.into_inner().into(),
        PaginationParams::default(), // TODO: use real PaginationParams
    )
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[post("/{publication_id}/favorite")]
async fn add_to_favorites(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    AddToFavorites::new(
        c.publishing.event_pub(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[delete("/{publication_id}/favorite")]
async fn remove_from_favorites(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    RemoveFromFavorites::new(
        c.publishing.event_pub(),
        c.publishing.interaction_repo(),
        c.publishing.publication_repo(),
        c.publishing.reader_repo(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[get("/{publication_id}/statistics")]
async fn get_statistics(
    req: HttpRequest,
    path: web::Path<String>,
    cmd: web::Query<GetStatisticsCommand>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    GetStatistics::new(
        c.publishing.publication_repo(),
        c.publishing.statistics_serv(),
    )
    .exec(user_id_and_role, path.into_inner(), cmd.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[get("/{publication_id}/contract")]
async fn get_contract(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    GetContractByPublication::new(c.payment.contract_repo(), c.payment.publication_repo())
        .exec(user_id_and_role, path.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[get("/{publication_id}/contract/summaries")]
async fn generate_summaries(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    GenerateSummariesForPublication::new(
        c.payment.event_pub(),
        c.payment.contract_repo(),
        c.payment.publication_repo(),
        c.payment.contract_serv(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

#[get("/{publication_id}/contract/can-request")]
async fn can_request_contract(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    CanRequestContract::new(c.payment.publication_repo(), c.payment.contract_serv())
        .exec(user_id_and_role, path.into_inner())
        .await
        .map(|res| HttpResponse::Ok().json(res))
        .map_err(PublicError::from)
}

#[post("/{publication_id}/contract")]
async fn request_contract(
    req: HttpRequest,
    path: web::Path<String>,
    c: web::Data<MainContainer>,
) -> impl Responder {
    let user_id_and_role = auth(&req, &c).await?;

    RequestContract::new(
        c.payment.event_pub(),
        c.payment.contract_repo(),
        c.payment.publication_repo(),
        c.payment.contract_serv(),
    )
    .exec(user_id_and_role, path.into_inner())
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(PublicError::from)
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/publications")
            .service(create)
            .service(search)
            .service(get_by_id)
            .service(update)
            .service(update_pages)
            .service(delete)
            .service(publish)
            .service(approve)
            .service(reject)
            .service(read)
            .service(like)
            .service(unlike)
            .service(review)
            .service(delete_review)
            .service(get_reviews)
            .service(get_collections)
            .service(add_to_favorites)
            .service(remove_from_favorites)
            .service(get_statistics)
            .service(get_contract)
            .service(generate_summaries)
            .service(can_request_contract)
            .service(request_contract),
    );
}
