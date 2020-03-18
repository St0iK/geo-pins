import React, {useEffect, useState, useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import PinIcon from "./PinIcon";
import Context from "../context";
import Blog from "./Blog";
import { useClient } from '../client';
import { GET_PINS_QUERY } from '../graphql/queries'
import { DELETE_PIN_MUTATION } from '../graphql/mutations'
import differenceInMinutes from 'date-fns/difference_in_minutes';
import { Typography } from "@material-ui/core";
import { Subscription } from "react-apollo";
import { PIN_ADDED_SUBSCRIPTION, PIN_UPDATED_SUBSCRIPTION, PIN_DELETED_SUBSCRIPTION } from "../graphql/subscriptions";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";

// import { pink } from "@material-ui/core/colors";

import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

const INITIAL_VIEWPORT = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13
}
const Map = ({ classes }) => {

  const mobileSize = useMediaQuery('(max-width: 650px)')
  const client = useClient();
  const { state, dispatch } = useContext(Context);


  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    getUserPosition();
  }, []);

  useEffect(() => {
    getPins();
  }, []);


  const [popup, setPopup] = useState(null);

  // remove popUp if pin is deleted by the author of the pin
  useEffect(() => {
    const pinExists = popup && state.pins.findIndex(pin => pin._id === popup._id) > -1
    if (!pinExists) {
      setPopup(null);
    }
  }, [state.pins.length])

  const getUserPosition = () => {
    if("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        setViewport({...viewport, latitude, longitude})
        setUserPosition({latitude, longitude})
      });
    }
  }

  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY)
    dispatch({type:'GET_PINS', payload: getPins})
  }

  const handleMapClick = ({lngLat, leftButton}) => {
    if (!leftButton) return;
    if (!state.draft) {
      dispatch({type: "CREATE_DRAFT"});
    }

    const [longitude, latitude] = lngLat;

    dispatch({
      type: 'UPDATE_DRAFT_LOCATION',
      payload: { longitude, latitude }
    })
  }

  const hightlightNewPin = pin => {
    const isNewPin = differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 30;
    return isNewPin ? 'limegreen' : 'darkblue'
  }

  const handleSelectPin = pin => {
    setPopup(pin);
    dispatch({type: 'SET_PIN', payload: pin});
  }

  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async (pin, e) => {
    e.preventDefault();
    await client.request(DELETE_PIN_MUTATION, { pinId: pin._id });
    setPopup(null);
  }

  return (<div className={mobileSize? classes.rootMobile : classes.root}>
    <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1Ijoiamltc3RvaWsxMyIsImEiOiJjazJ0MWRjbXgwbm5wM210ajhtZTZ0aXN2In0.AUPUdKHqvgoAGLPjRf_KtA"
        {...viewport}
        onClick={handleMapClick}
        onViewportChange={newViewport => setViewport(newViewport)}
    >
    <div className={classes.navigationControl}>
      <NavigationControl onViewportChange={newViewport => setViewport(newViewport)}/>
    </div>

      {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-19}
            offsetTop={-37}>

            <PinIcon size={40} color="red" />

          </Marker>
      )}


      {state.draft && (
          <Marker
              latitude={state.draft.latitude}
              longitude={state.draft.longitude}
              offsetLeft={-19}
              offsetTop={-37}>

            <PinIcon size={40} color="hotpink" />

          </Marker>
      )}


      {/* Created Pins */}
      {state.pins.map(pin => (
         <Marker
         key={pin._id}
         latitude={pin.latitude}
         longitude={pin.longitude}
         offsetLeft={-19}
         offsetTop={-37}>

        <PinIcon 
        onClick={() => handleSelectPin(pin)}
        size={40} color={hightlightNewPin(pin)} />

      </Marker>
      ))}



        {popup && (
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img 
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)} 
              </Typography>
              {isAuthUser() && (
                <Button onClick={(e) => handleDeletePin(popup, e)}>
                  <DeleteIcon className={classes.deleteIcon}/>
                </Button>
              )}
            </div>
          </Popup>
        )}

    </ReactMapGL>

    <Subscription
      subscription={PIN_ADDED_SUBSCRIPTION}
      onSubscriptionData={ ({subscriptionData}) => {
        const { pinAdded } = subscriptionData.data;
        dispatch({type: 'CREATE_PIN', payload: pinAdded})
      }}
    />

      <Subscription
        subscription={PIN_UPDATED_SUBSCRIPTION}
        onSubscriptionData={ ({subscriptionData}) => {
          const { pinUpdated } = subscriptionData.data;
          dispatch({type: 'CREATE_COMMENT', payload: pinUpdated})
        }}
      />

      <Subscription
        subscription={PIN_DELETED_SUBSCRIPTION}
        onSubscriptionData={ ({subscriptionData}) => {
          const { pinDeleted } = subscriptionData.data;
          dispatch({type: 'DELETE_PIN', payload: pinDeleted})
        }}
      />


    {/*Area to add Pin Content*/}

    <Blog />
  </div>


  );
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
