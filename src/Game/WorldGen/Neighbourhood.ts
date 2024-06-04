import {EventEmitter} from "excalibur";
import {NeighborInterface} from "./NeighborInterface.ts";

type NewNeighborEvent<Neighbor extends NeighborInterface> = {
    neighbor: Neighbor
}

type NeighborhoodEvents<Neighbor extends NeighborInterface> = {
    new: NewNeighborEvent<Neighbor>,
}

export class Neighbourhood<Neighbor extends NeighborInterface> {
    private readonly events = new EventEmitter<NeighborhoodEvents<Neighbor>>();
    private readonly neighbours = new Map<Neighbor, Neighbor[]>;

    add(neighbor: Neighbor): void {
        if (this.neighbours.has(neighbor)) {
            return;
        }

        this.neighbours.set(neighbor, []);
        this.events.emit<'new'>('new', {neighbor});

        this.events.on('new', ({neighbor: newNeighbor}) => {
            if (neighbor === newNeighbor) {
                return;
            }

            const neighborPoints = newNeighbor.getNeighbourhoodPoints();
            for (const point of neighbor.getNeighbourhoodPoints()) {
                for (const neighborPoint of neighborPoints) {
                    if (!point.equals(neighborPoint, 1)) {
                        continue;
                    }

                    this.neighbours.get(neighbor)?.push(newNeighbor);
                    this.neighbours.get(newNeighbor)?.push(neighbor);
                    return;
                }
            }
        });
    }

    getNeighbors(neighbor: Neighbor): ReadonlyArray<Neighbor> {
        return this.neighbours.get(neighbor) ?? [];
    }
}