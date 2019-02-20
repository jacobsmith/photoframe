import React from 'react';
import { Dimensions, Image, StyleSheet, Slider, Picker, TouchableWithoutFeedback, Text, View } from 'react-native';
import * as Expo from 'expo';
import AlbumViewer from 'src/albumViewer';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      albums: [],
      photos: [],
      photoIndex: 0,
      duration: 5,
    };
  }

  async componentDidMount() {
    await Expo.Permissions.askAsync(Expo.Permissions.CAMERA_ROLL);

    const albums = await Expo.MediaLibrary.getAlbumsAsync();
    this.setState({
      albums
    });

    this.setState({
      selectedAlbumId: albums[0]
    }, this.getPhotos);

    this.handleSlider(this.state.duration);
  }

  handleSlider = (value) => {
    this.setState({
      duration: value,
    }, () => {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
          if (this.state.photoIndex === this.state.photos.length - 1) {
            this.setState({ photoIndex: 0 });
          } else {
            this.setState({ photoIndex: this.state.photoIndex + 1 });
          }
        }, this.state.duration * 1000);
    });
  }

  handleAlbumSelect = ({ itemValue }) => {
    this.setState({
      selectedAlbumId: itemValue
    }, this.getPhotos);
  }

  settings = () => {
    if (!this.state.showSettings) {
      return null;
    }

    return (
      <View style={{ backgroundColor: '#fff', flex: 1, width: Dimensions.get('window').width }}>
        <Picker onValueChange={ this.handleAlbumSelect }>
          { this.state.albums.map((album) => {
            return <Picker.Item key={ album.id } label={ album.title } value={ album.id } />
          })}
        </Picker>

        <Slider maximumValue={10} minimumValue={1} step={1} onValueChange={ this.handleSlider } value={ this.state.duration } />
      </View>
    )
  }

  selectedAlbum() {
    let album;
    if (this.state.selectedAlbumId) {
      album = this.state.albums.find((album) => album.id === this.state.selectedAlbumId);
    } else {
      album = this.state.albums[0];
    }

    return album;
  }

  getPhotos = async () => {
    const photos = await Expo.MediaLibrary.getAssetsAsync({
      album: this.state.selectedAlbumId,
      first: 5000,
    });

    this.setState({ photos: photos.assets, loading: false });
  }

  prettyDate2 = () => {
    const date = new Date();
    return date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute:'2-digit'
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback style={styles.container} onPress={ () => this.setState({ showSettings: !this.state.showSettings })}>
        <View style={ styles.container }>

          { (this.state.photos.length > 0 && this.state.photoIndex > -1)
            ? (
              <View style={{ flex: 1 }}>
              <View style={ { flex: 1 } }>
                <Image source={ { uri: this.state.photos[this.state.photoIndex].uri } } resizeMode='contain' style={ { flex: 1, width: Dimensions.get('window').width } } />
              </View>
              <View style={{ position: 'absolute', bottom: 10, left: 10 }}>
                <Text style={{ fontSize: 40, color: 'white', marginBottom: 5, marginLeft: 10, fontWeight: '100' }}>{ this.prettyDate2() }</Text>
                <Text style={{ fontSize: 32, color: 'white', marginBottom: 20, marginLeft: 10, fontWeight: '100' }}>{ new Date().toLocaleDateString() }</Text>
              </View>
              </View>
            )
            : null }
          { this.settings() }
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
