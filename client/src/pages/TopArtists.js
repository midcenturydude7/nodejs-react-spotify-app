import React from 'react';
import { getTopArtists } from '../spotify';
import { catchErrors } from '../utils';
import { SectionWrapper, ArtistsGrid, TimeRangeButtons } from '../components';

const TopArtists = () => {
  const [topArtists, setTopArtists] = React.useState(null);
  const [activeRange, setActiveRange] = React.useState('short');


  React.useEffect(() => {
    const fetchData = async () => {
      const userTopArtists = await getTopArtists(`${activeRange}_term`);
      setTopArtists(userTopArtists.data);
    };

    catchErrors(fetchData());
  }, [activeRange]);
  
  return (
    <main>
      {topArtists && (
        <SectionWrapper title="Top artists" breadcrumb="true">
          <TimeRangeButtons activeRange={activeRange} setActiveRange={setActiveRange} />
          <ArtistsGrid artists={topArtists.items} />
        </SectionWrapper> 
      )}
    </main>
  );
}

export default TopArtists;