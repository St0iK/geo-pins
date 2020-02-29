import React, {useContext, useState} from "react";
import { GraphQLClient } from "graphql-request";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";
import Context from "../../context";
import axios from 'axios';
import { CREATE_PIN_MUTATION } from "../../graphql/mutations";

const CreatePin = ({ classes }) => {

  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { state, dispatch } = useContext(Context);

  const handleSubmit = async event => {
    event.preventDefault();
    
    setSubmitting(true);
  
    const url = await handleImageUpload();

    const idToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    const client = new GraphQLClient('http://localhost:4000/graphql', {
      headers: {authorization: idToken}
    });

    const { latitude, longitude } = state.draft;
    const variables = {title, image: url, content, latitude, longitude}
    const { createPin } = await client.request(CREATE_PIN_MUTATION, variables)

    console.log("Pin Create", { createPin });
    setSubmitting(false);
    handleDiscard();
  };

  const handleImageUpload = async () => {
    const data = new FormData();
    data.append('file', image);
    data.append('upload_preset', 'geopins');
    data.append('cloud_name', 'dsxxfn4cx')
    const res = await axios.post(
        "http://api.cloudinary.com/v1_1/dsxxfn4cx/image/upload",
        data
    );

    return res.data.url;
  };

  const handleDiscard = () => {
    setTitle('');
    setImage('');
    setContent('');
    dispatch({type:'DISCARD_FORM'});
  };

  return (
      <form className={classes.form}>
        <Typography
        className={classes.alignCenter}
        component="h2"
        variant="h4"
        color="secondary"
        >
         <LandscapeIcon className={classes.iconLarge}/> Pin Location
        </Typography>
          <div>
            <TextField
                name='title'
                label='Title'
                placeholder='Insert Pin Title'
                onChange={event => setTitle(event.target.value)}
            />

            <input
                id='image'
                accept='image/*'
                type='file'
                className={classes.input}
                onChange={event => setImage(event.target.files[0])}
                style={{color: image && 'green'}}
            />

            <label htmlFor='image'>
              <Button
                  component='span'
                  size='small'
                  className={classes.button}
              >
              <AddAPhotoIcon />
              </Button>
            </label>
          </div>

        <div className={classes.contentField}>
            <TextField
              name='content'
              label='content'
              multiline
              rows='6'
              margin='normal'
              fullWidth
              variant='outlined'
              onChange={event => setContent(event.target.value)}
            />
        </div>


        <div>
          <Button
          className={classes.button}
          variant='contained'
          color='primary'
          onClick={handleDiscard}
          >
            <ClearIcon className={classes.leftIcon} />
            Discard
          </Button>

          <Button
              type='submit'
              className={classes.button}
              variant='contained'
              color='secondary'
              disabled={submitting || !title.trim() || !image || !content.trim()}
              onClick={handleSubmit}
          >
            Submit
            <SaveIcon className={classes.rightIcon} />
          </Button>
        </div>
      </form>
  );
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreatePin);
