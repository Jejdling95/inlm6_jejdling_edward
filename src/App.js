import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "./Components/MovieCard";
import YouTube from "react-youtube";

function App() {
  const IMAGE_PATH = "https://image.tmdb.org/t/p/w1280";
  const API_URL = "https://api.themoviedb.org/3";
  const API_KEY = "26bdb6d541718373486de66fb6fa7998";

  //const för movie-objects
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [selectedMovie, setSelectedMovie] = useState({});
  const [playTrailer, setPlayTrailer] = useState(false);
  const [toWatchMovies, setToWatchMovies] = useState([]);

  const addToWatchList = async () => {
    const response = await fetch(
      `https://www.omdbapi.com?apikey=5f335913&i=${selectedMovie.imdb_id}`
    ); //notera att det inte är vanliga "fnuttar" utan "``". ${title}
    const data = await response.json();

    var check = false;
    for (let i = 0; i < toWatchMovies.length; i++) {
      if (toWatchMovies[i].imdbID === data.imdbID) {
        alert("This movie is already in your list");
        check = true;
      }
    }
    if (check === false) {
      setToWatchMovies([...toWatchMovies, data]);
    }
  };

  const displayWatchList = () => {
    if (toWatchMovies.length === 0) {
      alert("You have not created an To-Watch-List");
    } else {
      setMovies(toWatchMovies);
    }
  };

  /**
   *
   * Hämtar alla filmer som matchar mot searchKey
   */
  const fetchMovies = async (searchKey) => {
    await fetch(`https://www.omdbapi.com?apikey=5f335913&s=${searchKey}`)
      .then(async (response) => {
        const data = await response.json();
        setMovies(data.Search);
        selectMovie(data.Search[0]);
      })
      .catch((error) => {
        console.log(error);
        setMovies(movies); //setMovies till tidigare movies för att undvika krash
        setSelectedMovie(selectedMovie); // Samma som ovan
        alert("No movies where found");
      });
  };

  /**
   *
   * Hämtar EN film som matchar mot imdbID
   */
  const fetchMovie = async (id) => {
    const { data } = await axios
      .get(`${API_URL}/movie/${id}`, {
        params: {
          api_key: API_KEY,
          append_to_response: "videos",
          external_source: "imdb_id",
        },
      })
      .catch((error) => {
        alert("Could not find the movie-trailer");
      });
    return data;
  };

  const selectMovie = async (movie) => {
    setPlayTrailer(false);

    const data = await fetchMovie(movie.imdbID);
    setSelectedMovie(data);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    fetchMovies("harry potter");
  }, []);

  const searchMovies = (event) => {
    event.preventDefault();
    fetchMovies(searchKey);
  };

  /**
   *
   * Hämtar trailer
   */
  const renderTrailer = () => {
    console.log(
      "Förstår ej nedan felmeddelande och github/stackoverflow säger i stort sätt att det ej går att lösa, trist :/"
    );
    const trailer = selectedMovie.videos.results.find(
      (vid) => vid.name === "Official Trailer"
    );

    const key = trailer
      ? trailer.key
      : selectedMovie.videos.results.slice(-1)[0].key;
    return (
      <YouTube
        className="youtube-container"
        videoId={key}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            origin: "http://localhost:3000",
          },
        }}
      />
    );
  };

  /**
   *
   * Funktionen som renderar ut alla filmer (kallar på komponenten MovieCard)
   */
  const renderMovies = () =>
    movies.map((movie) => (
      <MovieCard key={movie.imdbID} movie={movie} selectMovie={selectMovie} />
    ));

  /**
   *
   * ------------RETURN---------------
   */
  return (
    <div className="App">
      <header className="header">
        <div className="header-content max-center"></div>
      </header>

      <div
        className="hero"
        style={{
          backgroundImage: `url('${IMAGE_PATH}${selectedMovie.backdrop_path}')`,
        }}
      >
        <div className="hero-content max-center">
          {playTrailer ? (
            <button
              className="button button--close"
              onClick={() => setPlayTrailer(false)}
            >
              Close
            </button>
          ) : null}

          {selectedMovie.videos && playTrailer ? renderTrailer() : null}
          <div className="buttons">
            <button className="button" onClick={() => setPlayTrailer(true)}>
              Play trailer
            </button>
            <button className="button" onClick={addToWatchList}>
              + Add to watch-list
            </button>
          </div>

          <h1 className="hero-title">{selectedMovie.title}</h1>
          {selectedMovie.overview ? (
            <p className="hero-overview">{selectedMovie.overview} </p>
          ) : null}
        </div>
      </div>
      <div className="search-div">
        <form className="search-form" onSubmit={searchMovies}>
          <input
            type="text"
            placeholder="Search for movies"
            onChange={(event) => setSearchKey(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <button className="button" onClick={displayWatchList}>
          Your Watch List ({toWatchMovies.length})
        </button>
      </div>

      <div className="container max-center">{renderMovies()}</div>
    </div>
  );
}

export default App;
