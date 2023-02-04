import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import { ButtonGroup } from "../handlers/button.handler";
import { prisma } from "../handlers/db.handler";

export const generateVotingActionRows = async (userId: string, candidateId?: string) => {
    const candidates = await prisma.candidate.findMany()
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    rows.push(
        new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    disabled: true,
                    label: "Oddaj głos w wyborach:",
                    customId: "info",
                    style: ButtonStyle.Secondary
                })
            ]
        })
    )
    for (const candidate of candidates) {
        rows.push(
            new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        customId: `vote_select_${candidate.id}`,
                        style: ButtonStyle.Secondary,
                        label: candidate.id === candidateId ? "✓" : " ",
                        disabled: candidate.id === userId
                    }),
                    new ButtonBuilder({
                        style: ButtonStyle.Primary,
                        disabled: true,
                        label: `${candidate.firstname} ${candidate.lastname}`,
                        customId: candidate.id
                    })
                ]
            })
        )
    }
    rows.push(
        new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    style: ButtonStyle.Success,
                    label: "Oddaj głos",
                    disabled: !candidateId,
                    customId: candidateId ? `vote_vote_${candidateId}` : "vote"
                }),
                new ButtonBuilder({
                    style: ButtonStyle.Danger,
                    label: "Anuluj oddawanie głosu",
                    customId: "cancel"
                })
            ]
        })
    )
    return rows
}

const voteGroup: ButtonGroup = {
    id: 'vote',
    handler(interaction) {
        const args = interaction.customId.split('_')
        args.shift()
        const method = args.shift()
        switch (method) {
            case "select": {
                handleCandidateSelection(args[0], interaction)
                break
            }
            case "vote": {
                handleVote(args[0], interaction)
                break
            }
            case "delete": {
                handleVoteDelete(interaction)
                break
            }
        }
    },
}

const handleCandidateSelection = async (candidateId: string, interaction: ButtonInteraction) => {
    const rows = await generateVotingActionRows(interaction.user.id, candidateId)
    interaction.update({
        components: rows
    })
}

const handleVote = async (candidateId: string, interaction: ButtonInteraction) => {
    const prevVote = await prisma.vote.findUnique({
        where: {
            userId: interaction.user.id
        }
    })
    if (prevVote) {
        await prisma.vote.delete({
            where: {
                userId: interaction.user.id
            }
        })
    }
    await prisma.vote.create({
        data: {
            candidateId,
            userId: interaction.user.id
        }
    })

    interaction.update({
        embeds: [
            new EmbedBuilder({
                title: "Oddano głos",
                color: 0x55ff55
            })
        ],
        components: [
            // new ActionRowBuilder<ButtonBuilder>({
            //     components: [
            //         new ButtonBuilder({
            //             customId: "vote_delete",
            //             label: "Usuń głos",
            //             style: ButtonStyle.Danger
            //         })
            //     ]
            // })
        ]
    })
}

const handleVoteDelete = async (interaction: ButtonInteraction) => {
    await prisma.vote.delete({
        where: {
            userId: interaction.user.id
        }
    })
    interaction.update({
        components: [],
        embeds: [
            new EmbedBuilder({
                title: "Usunięto głos w wyborach",
                color: 0xff5555
            })
        ]
    })
}

export default voteGroup