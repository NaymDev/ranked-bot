import { Player } from "@/database"
import { DEFAULT_RANGE } from ".."

export interface QueueParticipant {
    getID(): string
    getSkips(): number
    getElo(): number
    getAllPlayerIds(): string[]
    getRange(): number
    skipped(): void
}

export class SoloParticipant implements QueueParticipant {
    private id: string
    private skips: number

    constructor(id: string) {
        this.id = id
        this.skips = 0
    }

    getRange(): number {
        return DEFAULT_RANGE + this.skips * 5
    }

    skipped(): void {
        this.skips++
    }

    getAllPlayerIds(): string[] {
        return [this.id]
    }

    getID(): string {
        return this.id
    }

    getSkips(): number {
        return this.skips
    }

    getElo(): number {
        return Player.getRankedElo(this.id)
    }
}
