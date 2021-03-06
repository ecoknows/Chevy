import React, { useState, useEffect } from 'react';
import Navigation from './navigations/Navigation'
import { AppLoading } from 'expo';
import { CheckNote } from './database/database';
import { CheckData } from './database/initial';
import { IngridientReset } from './database/tutorial';
import * as Font from 'expo-font';

const  getFonts =()=> Font.loadAsync({
  'OpenSans-bold' : require('./fonts/open-sans/OpenSans-Bold.ttf'),
  'OpenSans-extra-bold' : require('./fonts/open-sans/OpenSans-ExtraBold.ttf'),
  'OpenSans-semi-bold' : require('./fonts/open-sans/OpenSans-SemiBold.ttf'),
  'OpenSans-light' : require('./fonts/open-sans/OpenSans-Light.ttf'),
  'OpenSans-regular' : require('./fonts/open-sans/OpenSans-Regular.ttf'),
  'Ambit-bold' : require('./fonts/ambit/Ambit-Bold.otf'),
  'Ambit-light' : require('./fonts/ambit/Ambit-Light.otf'),
  'Ambit-regular' : require('./fonts/ambit/Ambit-Regular.otf'),
  'Ambit-semi-bold' : require('./fonts/ambit/Ambit-SemiBold.ttf'),
})

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    CheckData();
    IngridientReset();
  }, [])

  if(fontsLoaded){
    return(
      <Navigation/>
    );
  } else {
    
    return (
      <AppLoading
        startAsync={getFonts}
        onFinish={()=>setFontsLoaded(true)}
      />
    );
  }
  
}
