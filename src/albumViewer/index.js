import React from 'react';
import { ActivityIndicator, View, Image, Dimensions } from 'react-native';
import * as Expo from 'expo';

class AlbumViewer extends React.Component {
    constructor() {
        super();
       
        this.state = {
            photos: [],
            index: 0,
            loading: true,
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width,
        };
    }

    async componentDidMount() {
        const photos = await Expo.MediaLibrary.getAssetsAsync({
            album: this.props.album.id,
            first: 5000,
        })

        this.setState({ photos: photos.assets, loading: false });

        this.interval = setInterval(() => {
            if (this.state.index === this.state.photos.length - 1) {
                this.setState({ index: 0 });
            } else {
                this.setState({ index: this.state.index + 1 });
            }
        }, this.props.duration * 1000 || 2000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    onLayout = (event) => {
        this.setState({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
        })
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator />
                </View>
            );
        }

        const computeStyle = () => {
            return {
                flex: 1,
                width: this.state.width,
                height: this.state.height,
            }
        }

        return (
            <View style={ computeStyle() } onLayout={ this.onLayout }>
                <Image source={ { uri: this.state.photos[this.state.index].uri } } resizeMode='contain' style={ computeStyle() } />
            </View>
        )
    }
}

export default AlbumViewer;