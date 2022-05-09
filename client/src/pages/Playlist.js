import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getPlaylistById, getAudioFeaturesForTracks } from '../spotify';
import { catchErrors } from '../utils';
import { TrackList, SectionWrapper } from '../components';
import { StyledHeader } from '../styles';

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPLaylist] = React.useState(null);
  const [tracksData, setTracksData] = React.useState(null);
  const [tracks, setTracks] = React.useState(null);
  const [audioFeatures, setAudioFeatures] = React.useState(null);

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
 
  
    // Also update the audioFeatures state variable using the tracks IDs
    const fetchAudioFeatures = async () => {
      const ids = tracksData.items.map(({ track }) => track.id).join(',');
      const { data } = await getAudioFeaturesForTracks(ids);
      setAudioFeatures(audioFeatures => ([
        ...audioFeatures ? audioFeatures : [],
        ...data['audio_features']
      ]));
    };
    catchErrors(fetchAudioFeatures());

  }, [tracksData]);

  // Map over tracks and add audio_features property to each track
  const tracksWithAudioFeatures = React.useMemo(() => {
    if (!tracks || !audioFeatures) {
      return null;
    }
    return tracks.map(({ track }) => {
      const trackToAdd = track;

      if (!track.audio_features) {
        const audioFeaturesObj = audioFeatures.find(item => {
          if (!item || !track) {
            return null;
          }
          return item.id === track.id;
        });

        trackToAdd['audio_features'] = audioFeaturesObj;
      }

      return trackToAdd;
    });
  }, [tracks, audioFeatures]);

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
              {tracksWithAudioFeatures && (
                <TrackList tracks={tracksWithAudioFeatures} />
              )}
            </SectionWrapper>
          </main>
        </>
      )}
    </>
  );
};

export default Playlist;
