import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getPlaylistById } from '../spotify';
import { catchErrors } from '../utils';
import { TrackList, SectionWrapper } from '../components';
import { StyledHeader } from '../styles';

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPLaylist] = React.useState(null);
  const [tracksData, setTracksData] = React.useState(null);
  const [tracks, setTracks] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data } = await getPlaylistById(id);
      setPLaylist(data);
    };

    catchErrors(fetchData());
  }, [id]);

  // When tracksData updates, compile arrays of tracks and audioFeatures
  React.useEffect(() => {
    if (!tracksData) {
      return;
    }

    // When tracksData updates, checks if there are more tracks to fetch
    // then updates the state variable
    const fetchMoreData = async () => {
      if (tracksData.next) {
        const { data } = await axios.get(tracksData.next);
        setTracksData(data);
      }
    };

    setTracks(tracks => ([
      ...tracks ? tracks : [],
      ...tracksData.items
    ]));

    catchErrors(fetchMoreData());
  }, [tracksData]);
  
  const tracksForTracklist = React.useMemo(() => {
    if (!tracks) {
      return;
    }
    return tracks.map(({ track }) => track)
  }, [tracks])

  return (
    <>
      {playlist && (
        <>
          <StyledHeader>
            <div className="header__inner">
              {playlist.images.length && playlist.images[0].url && (
                <img className="header__img" src={playlist.images[0].url} alt="Playlist Artwork"/>
              )}
              <div>
                <div className="header__overline">Playlist</div>
                <h1 className="header__name">{playlist.name}</h1>
                <p className="header__meta">
                  {playlist.followers.total ? (
                    <span>{playlist.followers.total} {`follower${playlist.followers.total !== 1 ? 's' : ''}`}</span>
                  ) : null}
                  <span>{playlist.tracks.total} {`song${playlist.tracks.total !== 1 ? 's' : ''}`}</span>
                </p>
              </div>
            </div>
          </StyledHeader>

          <main>
            <SectionWrapper title="Playlist" breadcrumb={true}>
              {tracksForTracklist && (
                <TrackList tracks={tracksForTracklist} />
              )}
            </SectionWrapper>
          </main>
        </>
      )}
    </>
  );
};

export default Playlist;
