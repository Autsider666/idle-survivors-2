import Delaunator from 'delaunator';
import { Random } from 'excalibur';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import Randomizer from './Randomizer';

type Region = {
    x: number,
    y: number,
    elevation: number,
    moisture: number,
}

type RegionData = {
    delaunay: Delaunator<Region>, //TODO refactor asap
    points: Region[],
    numRegions: number,
    numTriangles: number,
    numEdges: number,
    halfedges: any,
    triangles: any,
    centers: Region[],
    elevation: number[],
    moisture: number[],
}

export class MapData {
    private readonly regions: Region[] = [];
    private readonly jitter: number = 0.5;
    private readonly waveLength: number = 0.5;
    private readonly random: Randomizer;
    private readonly noise: NoiseFunction2D;

    constructor(
        public readonly height: number,
        public readonly width: number,
        public readonly seed: number = Date.now(),
    ) {
        this.random = new Randomizer(this.seed);
        this.noise = createNoise2D(() => this.random.getFloat());
    }

    private generateRegions(): Region[] {
        const points: Region[] = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                points.push(this.random.randomizePoint({ x, y, elevation: 0, moisture: 0 }));
            }
        }

        // Preventing ragged edges. TODO https://www.redblobgames.com/x/2314-poisson-with-boundary/
        points.push({ x: -10, y: this.height / 2, elevation: 0, moisture: 0 });
        points.push({ x: this.width + 10, y: this.height / 2, elevation: 0, moisture: 0 });
        points.push({ y: -10, x: this.width / 2, elevation: 0, moisture: 0 });
        points.push({ y: this.height + 10, x: this.width / 2, elevation: 0, moisture: 0 });
        points.push({ x: -10, y: -10, elevation: 0, moisture: 0 });
        points.push({ x: this.width + 10, y: this.height + 10, elevation: 0, moisture: 0 });
        points.push({ y: -10, x: this.height + 10, elevation: 0, moisture: 0 });
        points.push({ y: this.height + 10, x: -10, elevation: 0, moisture: 0 });

        return points;
    }
}