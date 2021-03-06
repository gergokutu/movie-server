const { Router } = require('express')
const router = new Router()

const request = require('superagent')

const Movie = require('./model')

// poster URLs through tmdb API » Movie model
router.get(
  '/copy-movies',
  async (req, res, next) => {
    const base_url = 'http://image.tmdb.org/t/p/'
    const size = '/w185'

    try {
      // how to get all the pages not only the first (of 500) - ok
      // pageNumber < 501
      for (let pageNumber = 1; pageNumber < 9; pageNumber++) {
        const movies = await request.get(`https://api.themoviedb.org/3/discover/movie?page=${pageNumber}&include_video=false&include_adult=false&sort_by=popularity.desc&language=en-US&api_key=377f16c90eeda4700f91c1925bbe3668`)
        const { results } = movies.body
        console.log('Copy-movies:', results)
        // how to get the original_title as well from tmdb... - ok
        // how to fill up Movie model » posterUrl from an array - ok
        results.map(async (movie) => {
          try {
            const movies = await Movie.create(
              {
                title: movie.title,
                posterUrl: base_url.concat(size.concat(movie.poster_path)),
                overview: movie.overview,
                release: movie.release_date,
                rate: movie.vote_average,
                votes: movie.vote_count
              }
            )
          } catch (error) {
            console.log(error)
          }
        })
      }
      res.send('Upload finished')

    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/movies',
  async (req, res, next) => {
    try {
      const movies = await Movie.findAll()
      res.send(movies)
    } catch (error) {
      next(error)
    }
  }
)

// POST!!!
router.post(
  '/movies',
  async (req, res, next) => {
    try {
      const movie = await Movie.findOrCreate({
        where: {
          title: req.body.title,
          posterUrl: req.body.posterUrl
        }
      })
      res.send(movie)
    } catch (error) {
      next(error)
    }
  }
)

// Update » put (whole entity) vs patch (part)
router.put(
  '/movies/:id',
  async (req, res, next) => {
    try {
      const movieToChange = await Movie.findOne({ where: { id: req.params.id } })
      if (movieToChange) {
        movieToChange.update(req.body)
        res.send(movieToChange)
      } else {
        res.status(404).end()
      }
    } catch (error) {
      next(error)
    }
  }
)

// Delete » destroy
router.delete(
  '/movies/:id',
  async (req, res, next) => {
    try {
      const movieToDelete = await Movie.destroy({ where: { id: req.params.id } })
      if (movieToDelete) {
        res.status(204).end()
      }
      res.status(404).end()
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router