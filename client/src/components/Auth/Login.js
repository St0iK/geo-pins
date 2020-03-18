import React, { useContext } from "react";
import { GraphQLClient } from "graphql-request";
import { withStyles } from "@material-ui/core/styles";
import {GoogleLogin} from "react-google-login";
import Typography from "@material-ui/core/Typography";
import Context from "../../context";
import { ME_QUERY } from "../../graphql/queries";
import { BASE_URL } from '../../client';


const Login = ({ classes }) => {
  
  const { dispatch } = useContext(Context);

  const onSuccess = async googleUser => {
    const idToken = googleUser.getAuthResponse().id_token;
    const client = new GraphQLClient(BASE_URL, {
      headers: {authorization: idToken}
    });

    const { me } = await client.request(ME_QUERY);
    dispatch({type: 'LOGIN_USER', payload: me});
    dispatch({type: 'IS_LOGGED_IN', payload: googleUser.isSignedIn()});
  };

  const onFailure = error => {
    dispatch({type: 'IS_LOGGED_IN', payload: false});
  };

  return (
      <div className={classes.root}>
        <Typography component="h1" variant="h3" gutterBottom noWrap style={{color: "rgb(66,133,244)"}}>
          Welcome
        </Typography>
        <GoogleLogin
            onSuccess={onSuccess}
            onFailure={onFailure}
            clientId={'275895506254-jshpnbhjnhr2r4apn3lp30opbbpv0a49.apps.googleusercontent.com'}
            isSignedIn={true}
            theme="dark"
            buttonText="Login with Google"
        />
      </div>
  )
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
