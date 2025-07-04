/**
 * Choreographed Mode - Distributed coordination without central control
 * Enables autonomous coordination between actors through semantic contracts
 */

import { ExecutionContext } from '../../context/ExecutionContext'
import { SOLArtifact, Actor } from '../../artifacts/SOLArtifact'
import { SemanticDecision } from '../../types/SemanticDecision'
import { EventSystem, SemanticEvent } from '../../events/EventSystem'
import { ArtifactRepository } from '../../repositories/ArtifactRepository'
import { OrchestrationMode } from '../../types/OrchestrationMode'

export interface ChoreographedConfig {
  coordinationType: 'peer-to-peer' | 'hierarchical' | 'mesh' | 'hybrid'
  consensusAlgorithm: 'raft' | 'pbft' | 'gossip' | 'semantic-voting'
  quorumThreshold: number
  timeoutPeriod: number
  autonomyLevel: 'full' | 'constrained' | 'guided'
}

export interface ParticipantState {
  actorId: string
  role: 'proposer' | 'voter' | 'observer' | 'coordinator'
  status: 'active' | 'inactive' | 'suspended'
  authority: number
  reputation: number
  lastSeen: Date
  capabilities: string[]
}

export interface Proposal {
  id: string
  proposer: string
  timestamp: Date
  action: string
  target: string
  semanticJustification: string
  requiredConsensus: number
  votes: Map<string, Vote>
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  deadline: Date
}

export interface Vote {
  voter: string
  decision: 'approve' | 'reject' | 'abstain'
  weight: number
  reasoning: string[]
  timestamp: Date
}

export interface VotingSummary {
  totalVotes: number
  approvals: number
  rejections: number
  consensusReached: boolean
  weightedScore: number
}

export class ChoreographedMode {
  private readonly eventSystem: EventSystem
  private readonly artifactRepository: ArtifactRepository
  private readonly config: ChoreographedConfig
  private participants: Map<string, ParticipantState> = new Map()
  private activeProposals: Map<string, Proposal> = new Map()

  constructor(
    eventSystem: EventSystem,
    artifactRepository: ArtifactRepository,
    config: ChoreographedConfig
  ) {
    this.eventSystem = eventSystem
    this.artifactRepository = artifactRepository
    this.config = config
  }

  /**
   * Initialize choreographed orchestration
   */
  async initialize(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    // Register as participant
    await this.registerParticipant(context.getActor(), context)
    
    // Discover other participants
    await this.discoverParticipants(decision, context)
    
    // Update context state
    context.updateSemanticState({
      currentArtifact: decision.artifact,
      orchestrationMode: OrchestrationMode.CHOREOGRAPHED,
      startTime: new Date()
    })

    return context
  }

  /**
   * Coordinate execution through distributed consensus
   */
  async coordinate(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    // Create execution proposal
    const proposal = await this.createExecutionProposal(decision, context)
    
    // Broadcast proposal to participants
    await this.broadcastProposal(proposal, context)
    
    // Wait for consensus
    const consensusResult = await this.waitForConsensus(proposal)
    
    if (consensusResult.consensusReached) {
      // Execute coordinated action
      context = await this.executeCoordinatedAction(proposal, context)
    } else {
      // Handle consensus failure
      await this.handleConsensusFailure(proposal, context)
    }

    return context
  }

  /**
   * Register participant in choreographed execution
   */
  private async registerParticipant(actor: Actor, context: ExecutionContext): Promise<void> {
    const participantState: ParticipantState = {
      actorId: actor.metadata.id,
      role: this.determineParticipantRole(actor),
      status: 'active',
      authority: this.calculateAuthority(actor),
      reputation: 1.0,
      lastSeen: new Date(),
      capabilities: actor.capabilities
    }

    this.participants.set(actor.metadata.id, participantState)
  }

  /**
   * Discover other participants in the network
   */
  private async discoverParticipants(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<void> {
    // Implementation for participant discovery
    // This would involve querying the artifact repository for related actors
    // and sending discovery messages through the event system
  }

  /**
   * Create execution proposal
   */
  private async createExecutionProposal(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<Proposal> {
    const proposal: Proposal = {
      id: `proposal-${Date.now()}-${context.getActor().metadata.id}`,
      proposer: context.getActor().metadata.id,
      timestamp: new Date(),
      action: decision.executionStrategy,
      target: decision.artifact.metadata.id,
      semanticJustification: decision.reasoning.join('; '),
      requiredConsensus: this.calculateRequiredConsensus(),
      votes: new Map(),
      status: 'pending',
      deadline: new Date(Date.now() + this.config.timeoutPeriod)
    }

    this.activeProposals.set(proposal.id, proposal)
    return proposal
  }

  /**
   * Broadcast proposal to all participants
   */
  private async broadcastProposal(proposal: Proposal, context: ExecutionContext): Promise<void> {
    const proposalMessage = {
      type: 'choreographed.proposal',
      proposal,
      sender: context.getActor().metadata.id
    }

    // Broadcast through event system
    const event = {
      id: `proposal-${proposal.id}`,
      type: 'choreographed.proposal',
      source: context.getActor().metadata.id,
      timestamp: new Date(),
      payload: proposalMessage,
      metadata: {
        version: '1.0',
        format: 'json',
        classification: 'internal'
      },
      context: context.getContext().metadata.id,
      intent: context.getIntent().metadata.id,
      priority: 2
    }

    await this.eventSystem.publish(event as any)
  }

  /**
   * Wait for consensus on proposal
   */
  private async waitForConsensus(proposal: Proposal): Promise<VotingSummary> {
    return new Promise((resolve) => {
      const checkConsensus = () => {
        const votingSummary = this.calculateVotingSummary(proposal)
        
        if (votingSummary.consensusReached || proposal.deadline <= new Date()) {
          resolve(votingSummary)
        } else {
          setTimeout(checkConsensus, 1000)
        }
      }
      
      checkConsensus()
    })
  }

  /**
   * Execute coordinated action after consensus
   */
  private async executeCoordinatedAction(
    proposal: Proposal,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    // Mark proposal as approved
    proposal.status = 'approved'
    
    // Execute the coordinated action
    context.addResult({
      type: 'success',
      value: `Choreographed execution completed for ${proposal.action}`,
      metadata: {
        proposalId: proposal.id,
        consensusParticipants: Array.from(proposal.votes.keys())
      }
    })

    return context
  }

  /**
   * Handle consensus failure
   */
  private async handleConsensusFailure(proposal: Proposal, context: ExecutionContext): Promise<void> {
    proposal.status = 'rejected'
    
    context.addViolation({
      type: 'semantic',
      severity: 'medium',
      description: `Consensus failed for proposal ${proposal.id}`,
      violatedArtifact: proposal.target,
      remediation: 'Review proposal parameters and retry'
    })
  }

  /**
   * Process incoming vote
   */
  async processVote(proposalId: string, vote: Vote): Promise<void> {
    const proposal = this.activeProposals.get(proposalId)
    
    if (!proposal || proposal.status !== 'pending') {
      return
    }

    // Validate and store vote
    if (this.validateVote(vote, proposal)) {
      proposal.votes.set(vote.voter, vote)
    }
  }

  // Helper methods
  private determineParticipantRole(actor: Actor): 'proposer' | 'voter' | 'observer' | 'coordinator' {
    if (actor.capabilities.includes('coordination')) {
      return 'coordinator'
    } else if (actor.capabilities.includes('proposal')) {
      return 'proposer'
    } else {
      return 'voter'
    }
  }

  private calculateAuthority(actor: Actor): number {
    const levelWeights = {
      'strategic': 3,
      'tactical': 2,
      'operational': 1
    }
    
    return levelWeights[actor.level] || 1
  }

  private calculateRequiredConsensus(): number {
    const participantCount = this.participants.size
    return Math.ceil(participantCount * this.config.quorumThreshold)
  }

  private calculateVotingSummary(proposal: Proposal): VotingSummary {
    const votes = Array.from(proposal.votes.values())
    const totalVotes = votes.length
    const approvals = votes.filter(v => v.decision === 'approve').length
    const rejections = votes.filter(v => v.decision === 'reject').length
    
    const weightedScore = votes.reduce((sum, vote) => {
      const weight = vote.decision === 'approve' ? vote.weight : 
                    vote.decision === 'reject' ? -vote.weight : 0
      return sum + weight
    }, 0)
    
    const consensusReached = approvals >= proposal.requiredConsensus
    
    return {
      totalVotes,
      approvals,
      rejections,
      consensusReached,
      weightedScore
    }
  }

  private validateVote(vote: Vote, proposal: Proposal): boolean {
    const participant = this.participants.get(vote.voter)
    
    if (!participant || participant.status !== 'active') {
      return false
    }
    
    if (proposal.deadline <= new Date()) {
      return false
    }
    
    return true
  }

  // Configuration methods
  static createDefaultConfig(): ChoreographedConfig {
    return {
      coordinationType: 'peer-to-peer',
      consensusAlgorithm: 'semantic-voting',
      quorumThreshold: 0.6,
      timeoutPeriod: 30000,
      autonomyLevel: 'constrained'
    }
  }
} 