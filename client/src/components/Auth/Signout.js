import React, {useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";
import { GoogleLogout } from "react-google-login";
import Context from "../../context";

const Signout = ({ classes }) => {
  const {dispatch} = useContext(Context);
  const onSignOut = () => {
    dispatch({type: 'SIGNOUT_USER'})
  };

  return (
      <GoogleLogout buttonText={"Sign out"}

        onLogoutSuccess={onSignOut}
        render={ ({onClick})=> (
            <span className={classes.root} onClick={onClick}>
              <Typography variant={"body1"} className={classes.buttonText}>
                  Sign Out
              </Typography>

              <ExitToAppIcon className={classes.buttonIcon}/>
            </span>

      )}>
      </GoogleLogout>
  );
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex"
  },
  buttonText: {
    color: "orange"
  },
  buttonIcon: {
    marginLeft: "5px",
    color: "orange"
  }
};

export default withStyles(styles)(Signout);
