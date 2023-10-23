import React from 'react';

export const Links = () => {
  const links = JSON.parse(process.env.REACT_APP_LINKS);
  const renderedLinks = links.map(([name, url]) => (
    <button key={name}>
      <a href={url} target="_blank" rel="noreferrer">
        {name}
      </a>
    </button>
  ));
  
  return (
    <div className='linkContainer'>
      <div className='LinkBio'>
        <p>
          {process.env.REACT_APP_SHORT_BIO}
        </p>
      </div>
      {renderedLinks}
    </div>
  );
};
