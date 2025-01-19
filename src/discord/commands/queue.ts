import {
    channelLink,
    ChannelType,
    InteractionContextType,
    SlashCommandBuilder,
    type BaseGuildVoiceChannel,
    type ChatInputCommandInteraction,
} from "discord.js"

import { Queue } from "@/database"
import { UserError } from "@/lib/discord/UserError"
import { addToQueue, removeUserFromQueue } from "@/lib/queue"
import { SoloParticipant } from "@/lib/queue/participant"

export default {
    builder: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Joins/Leaves a queue without joining the VC.")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .addChannelTypes(ChannelType.GuildVoice)
                .setDescription("The channel to queue.")
                .setRequired(false),
        )
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })

        const oldQueue = removeUserFromQueue(interaction.user.id)
        if (oldQueue) return `Successfully removed you from ${channelLink(oldQueue, interaction.guildId!)}`

        const channel = interaction.options.getChannel("channel") as BaseGuildVoiceChannel
        if (!channel) throw new UserError("You must specify the queue channel you want to join.")

        const queue = Queue.cache.get(channel.id)
        if (!queue) throw new UserError(`${channel} is not a queue channel!`)

        switch (addToQueue(queue, interaction.user.id)) {
            case 2:
                throw new UserError("You must wait 1 minute between queueing a game and requeuing.")
            case 3:
                throw new UserError("You must use /register first to use the ranked queue.")
        }

        return `Added you to the queue for ${channel}`
    },
}
