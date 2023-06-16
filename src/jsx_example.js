import React, { useState, useEffect } from "react";
//export {a};

const Card = props => {
  const [, setGenres] = useState([]);
  useEffect(() => {
    //setAnime(props.anime);
    const newGenres = props.anime.genres.map(genre => genre.name);
    setGenres(newGenres);
  }, [props.anime]);
  return <React.Fragment>
      <div className="card shadow text-white bg-dark mb-2 ho" style={{
      cursor: "pointer"
    }}></div>
    </React.Fragment>;
};
export default Card;