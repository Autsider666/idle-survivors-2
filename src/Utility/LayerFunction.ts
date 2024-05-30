import {BoundingBox} from "excalibur";

export class LayerFunction {
    static iterateGridByArea(
        area: BoundingBox,
        gridWidth: number,
        gridHeight: number,
        callback: (gridX:number, gridY:number) => void,
    ): void {
        let maxX = area.right / gridWidth;
        if (Number.isInteger(maxX)) {
            maxX--;
        } else {
            maxX = Math.floor(maxX);
        }

        let maxY = area.bottom / gridHeight;
        if (Number.isInteger(maxY)) {
            maxY--;
        } else {
            maxY = Math.floor(maxY);
        }

        for (let gridX = Math.floor(area.left / gridWidth); gridX <= maxX; gridX++) {
            for (let gridY = Math.floor(area.top / gridHeight); gridY <= maxY; gridY++) {
                callback(gridX,gridY);
            }
        }
    }
}