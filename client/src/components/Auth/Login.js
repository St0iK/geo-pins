import React from "react";
import { GraphQLClient } from "graphql-request";
import { withStyles } from "@material-ui/core/styles";
import {GoogleLogin} from "react-google-login";
import Typography from "@material-ui/core/Typography";

const Login = ({ classes }) => {

  const ME_QUERY = `
{
  me {
    _id
    name
    email
    picture
  }
}`;
  const onSuccess = async googleUser => {
    console.log({ googleUser });

    const idToken = googleUser.getAuthResponse().id_token;
    const client = new GraphQLClient('http://localhost:4000/graphql', {
      headers: {authorization: idToken}
    });

    const data = await client.request(ME_QUERY);
    console.log(data);

  };

  const onFailure = error => {
    console.log({ error });
  };

  return <GoogleLogin
      onSuccess={onSuccess}
      onFailure={onFailure}
      clientId={'275895506254-jshpnbhjnhr2r4apn3lp30opbbpv0a49.apps.googleusercontent.com'}
      isSignedIn={true}
  />
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
