import React from 'react';
import { getTopTracks } from '../spotify';
import { catchErrors } from '../utils';
import { SectionWrapper, TrackList, TimeRangeButtons } from '../components';

const TopTracks = () => {
  const [topTracks, setTopTracks] = React.useState(null);
  const [activeRange, setActiveRange] = React.useState('short');


  React.useEffect(() => {
    const fetchData = async () => {
      const userTopTracks = await getTopTracks(`${activeRange}_term`);
      setTopTracks(userTopTracks.data);
    };

    catchErrors(fetchData());
  }, [activeRange]);
  
  return (
    <main>
      {topTracks && (
        <SectionWrapper title="Top artists" breadcrumb="true">
          <TimeRangeButtons activeRange={activeRange} setActiveRange={setActiveRange} />
          <TrackList tracks={topTracks.items} />
        </SectionWrapper> 
      )}
    </main>
  );
};

export default TopTracks;
