import React, { useState, useEffect } from "react";
import CardData from "./cardData.jsx";
//export {a};

const Card = (props) => {
  const [anime, setAnime] = useState({});
  useEffect(() => {
    setAnime(props.anime);

    //setGenres(newGenres);
  }, [props.anime]);
  return (
    <React.Fragment>
      <CardData anime={anime}></CardData>
      <div
        className="card shadow text-white bg-dark mb-2 ho"
        style={{
          cursor: "pointer",
        }}
      ></div>
    </React.Fragment>
  );
};
export default Card;

/*
folder, newline
*/
