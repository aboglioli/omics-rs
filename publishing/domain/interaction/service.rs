use std::sync::Arc;

use common::error::Error;
use common::result::Result;

use crate::domain::author::Author;
use crate::domain::collection::Collection;
use crate::domain::interaction::{
    CollectionFavorite, Comment, Follow, InteractionRepository, Like, PublicationFavorite,
    ReaderAuthorId, ReaderCollectionId, ReaderPublicationId, Reading, Review, Stars, View,
};
use crate::domain::publication::Publication;
use crate::domain::reader::Reader;

pub struct InteractionService {
    interaction_repo: Arc<dyn InteractionRepository>,
}

impl InteractionService {
    pub fn new(interaction_repo: Arc<dyn InteractionRepository>) -> Self {
        InteractionService { interaction_repo }
    }

    pub async fn add_view(&self, reader: &Reader, publication: &mut Publication) -> Result<View> {
        let views_res = self
            .interaction_repo
            .find_views(
                Some(reader.base().id()),
                Some(publication.base().id()),
                None,
                None,
            )
            .await;
        let unique = if let Ok(views) = views_res {
            views.is_empty()
        } else {
            true
        };

        let mut view = publication.view(reader, unique)?;
        self.interaction_repo.save_view(&mut view).await?;

        Ok(view)
    }

    pub async fn add_reading(
        &self,
        reader: &Reader,
        publication: &mut Publication,
    ) -> Result<Reading> {
        let mut reading = publication.read(reader)?;
        self.interaction_repo.save_reading(&mut reading).await?;

        Ok(reading)
    }

    pub async fn add_like(&self, reader: &Reader, publication: &mut Publication) -> Result<Like> {
        let likes_res = self
            .interaction_repo
            .find_likes(
                Some(reader.base().id()),
                Some(publication.base().id()),
                None,
                None,
            )
            .await;
        if let Ok(likes) = likes_res {
            if !likes.is_empty() {
                return Err(Error::new("like", "already_liked"));
            }
        }

        let mut like = publication.like(reader)?;
        self.interaction_repo.save_like(&mut like).await?;

        Ok(like)
    }

    pub async fn delete_like(&self, reader: &Reader, publication: &mut Publication) -> Result<()> {
        let likes = self
            .interaction_repo
            .find_likes(
                Some(reader.base().id()),
                Some(publication.base().id()),
                None,
                None,
            )
            .await?;
        if likes.is_empty() {
            return Err(Error::new("like", "not_liked"));
        }

        publication.unlike(reader)?;

        self.interaction_repo
            .delete_like(&reader.base().id(), &publication.base().id())
            .await?;

        Ok(())
    }

    pub async fn add_review(
        &self,
        reader: &Reader,
        publication: &mut Publication,
        stars: Stars,
        comment: Comment,
    ) -> Result<Review> {
        let reviews_res = self
            .interaction_repo
            .find_reviews(
                Some(reader.base().id()),
                Some(publication.base().id()),
                None,
                None,
            )
            .await;
        if let Ok(reviews) = reviews_res {
            if !reviews.is_empty() {
                return Err(Error::new("review", "existing"));
            }
        }

        let mut review = publication.review(reader, stars, comment)?;
        self.interaction_repo.save_review(&mut review).await?;

        Ok(review)
    }

    pub async fn delete_review(
        &self,
        reader: &Reader,
        publication: &mut Publication,
    ) -> Result<()> {
        let mut reviews = self
            .interaction_repo
            .find_reviews(
                Some(reader.base().id()),
                Some(publication.base().id()),
                None,
                None,
            )
            .await?;
        if reviews.is_empty() {
            return Err(Error::new("review", "not_reviewed"));
        }

        let review = reviews.remove(0);

        publication.delete_review(reader, review.stars())?;

        self.interaction_repo
            .delete_review(&reader.base().id(), &publication.base().id())
            .await?;

        Ok(())
    }

    pub async fn add_publication_favorite(
        &self,
        reader: &mut Reader,
        publication: &Publication,
    ) -> Result<()> {
        let favorites_res = self
            .interaction_repo
            .find_publication_favorites(
                Some(reader.base().id()),
                Some(publication.base().id()),
                None,
                None,
            )
            .await;

        if let Ok(favorites) = favorites_res {
            if !favorites.is_empty() {
                return Err(Error::new("favorite", "already_exists"));
            }
        }

        let mut favorite = reader.add_publication_to_favorites(publication)?;

        self.interaction_repo
            .save_publication_favorite(&mut favorite)
            .await?;

        Ok(())
    }

    pub async fn delete_publication_favorite(
        &self,
        reader: &mut Reader,
        publication: &Publication,
    ) -> Result<()> {
        let favorites = self
            .interaction_repo
            .find_publication_favorites(
                Some(reader.base().id()),
                Some(publication.base().id()),
                None,
                None,
            )
            .await?;

        if favorites.is_empty() {
            return Err(Error::new("favorite", "does_not_exist"));
        }

        reader.remove_publication_from_favorites(publication)?;

        self.interaction_repo
            .delete_publication_favorite(reader.base().id(), publication.base().id())
            .await?;

        Ok(())
    }

    pub async fn add_collection_favorite(
        &self,
        reader: &mut Reader,
        collection: &Collection,
    ) -> Result<()> {
        let favorites_res = self
            .interaction_repo
            .find_collection_favorites(
                Some(reader.base().id()),
                Some(collection.base().id()),
                None,
                None,
            )
            .await;

        if let Ok(favorites) = favorites_res {
            if !favorites.is_empty() {
                return Err(Error::new("favorite", "already_exists"));
            }
        }

        let mut favorite = reader.add_collection_to_favorites(collection)?;

        self.interaction_repo
            .save_collection_favorite(&mut favorite)
            .await?;

        Ok(())
    }

    pub async fn delete_collection_favorite(
        &self,
        reader: &mut Reader,
        collection: &Collection,
    ) -> Result<()> {
        let favorites = self
            .interaction_repo
            .find_collection_favorites(
                Some(reader.base().id()),
                Some(collection.base().id()),
                None,
                None,
            )
            .await?;

        if favorites.is_empty() {
            return Err(Error::new("favorite", "does_not_exist"));
        }

        reader.remove_collection_from_favorites(collection)?;

        self.interaction_repo
            .delete_collection_favorite(reader.base().id(), collection.base().id())
            .await?;

        Ok(())
    }

    pub async fn add_follow(&self, reader: &Reader, author: &mut Author) -> Result<()> {
        let follows_res = self
            .interaction_repo
            .find_follows(
                Some(reader.base().id()),
                Some(author.base().id()),
                None,
                None,
            )
            .await;

        if let Ok(follows) = follows_res {
            if !follows.is_empty() {
                return Err(Error::new("follow", "already_exists"));
            }
        }

        let mut follow = author.follow(reader)?;

        self.interaction_repo.save_follow(&mut follow).await?;

        Ok(())
    }

    pub async fn delete_follow(&self, reader: &Reader, author: &mut Author) -> Result<()> {
        let follows = self
            .interaction_repo
            .find_follows(
                Some(reader.base().id()),
                Some(author.base().id()),
                None,
                None,
            )
            .await?;

        if follows.is_empty() {
            return Err(Error::new("follow", "does_not_exist"));
        }

        author.unfollow(reader)?;

        self.interaction_repo
            .delete_follow(reader.base().id(), author.base().id())
            .await?;

        Ok(())
    }
}
