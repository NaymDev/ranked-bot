import { Queue } from "@/database"
import { removeUserFromQueue } from "."
import { startGame } from "../game/startGame"
import { addCooldown } from "./cooldown"
import { QueueParticipant } from "./participant"

export function pollQueue(queue: Queue, participants: QueueParticipant[]) {
    if (participants.reduce((sum, team) => sum + team.getAllPlayerIds().length, 0) < 2) return 0

    participants.sort((a, b) => a.getElo() - b.getElo())

    let games = 0
    for (let i = 0; i < participants.length-1; i++) {
        const entry = participants[i]
        const match = participants[i + 1]
        const abs_diff = Math.abs(match.getElo() - entry.getElo())
        if (abs_diff > entry.getRange() || abs_diff > match.getRange()) {
            entry.skipped()
            continue
        }

        for (const v of [entry, match]) {
            v.getAllPlayerIds().forEach(removeUserFromQueue)
            addCooldown(v.getID())
        }

        games++
        startGame(queue, [entry.getAllPlayerIds(), match.getAllPlayerIds()]).catch(console.error)
    }

    return games
}

