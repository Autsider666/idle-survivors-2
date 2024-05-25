import {ImageSource, Loader} from "excalibur";

export const Image = {
    Character003: new ImageSource('/assets/16x16/Character_003.png')
};

export class ImageLoader extends Loader {
    constructor() {
        super({loadables: Object.values(Image)});

        this.suppressPlayButton = true;
    }
}