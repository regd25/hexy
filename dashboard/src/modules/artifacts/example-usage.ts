/**
 * Example usage demonstrations for the Artifacts Module - Simplified Architecture
 * Simple examples showing how to use the module's functionality with direct EventBus integration
 */
import {
    ArtifactService,
    LocalStorageArtifactRepository,
    ValidationService,
} from './services'
import {
    ARTIFACT_TYPES,
    CreateArtifactPayload,
} from './types'

// Mock EventBus for examples
class MockEventBus {
    publish(event: string, data: unknown): void {
        console.log(`📡 Event: ${event}`, data)
    }
    
    subscribe(event: string, handler: (data: unknown) => void): () => void {
        console.log(`🔔 Subscribed to: ${event}`)
        return () => console.log(`🔕 Unsubscribed from: ${event}`)
    }
}

// Initialize services for examples with simplified architecture
const eventBus = new MockEventBus()
const repository = new LocalStorageArtifactRepository()
const artifactService = new ArtifactService(eventBus, repository)
const validationService = new ValidationService()

/**
 * Example 1: Create a simple artifact
 */
export async function createSimple(): Promise<void> {
    console.log('📝 Creating a simple artifact...')

    try {
        const payload: CreateArtifactPayload = {
            name: 'Customer Service Excellence',
            type: ARTIFACT_TYPES.PURPOSE,
            description:
                'Our commitment to providing exceptional customer service that exceeds expectations and builds lasting relationships.',
            purpose: 'Establish clear standards for customer service delivery',
            authority: 'Customer Service Manager',
            evaluationCriteria: [
                'Customer satisfaction scores above 90%',
                'Response time under 2 hours',
                'First-call resolution rate above 80%',
            ],
        }

        const artifact = await artifactService.createArtifact(payload)
        console.log('✅ Artifact created successfully!')
        console.log(`   ID: ${artifact.id}`)
        console.log(`   Name: ${artifact.name}`)
        console.log(`   Type: ${artifact.type}`)
        console.log(`   Created: ${artifact.createdAt.toLocaleString()}`)

        // Clean up
        await artifactService.deleteArtifact(artifact.id)
        console.log('🧹 Example artifact cleaned up')
    } catch (error) {
        console.error('❌ Failed to create simple artifact:', error)
    }
}

/**
 * Example 2: Validate an artifact
 */
export async function validate(): Promise<void> {
    console.log('🔍 Validating artifact quality...')

    try {
        // Create a test artifact
        const goodArtifact = await artifactService.createArtifact({
            name: 'Strategic Innovation Framework',
            type: ARTIFACT_TYPES.VISION,
            description:
                'A comprehensive framework for driving innovation across our organization, fostering creativity, and implementing breakthrough solutions that create competitive advantage.',
            purpose:
                'Guide innovation initiatives and establish systematic approach to breakthrough thinking',
            authority: 'Chief Innovation Officer',
            evaluationCriteria: [
                'Number of innovative projects launched',
                'Revenue from new products/services',
                'Employee engagement in innovation activities',
                'Time-to-market improvements',
            ],
        })

        // Validate the artifact
        const validation =
            await validationService.validateArtifact(goodArtifact)

        console.log('✅ Validation Results:')
        console.log(`   Valid: ${validation.isValid ? 'YES' : 'NO'}`)
        console.log(
            `   Semantic Score: ${(validation.semanticScore * 100).toFixed(1)}%`
        )
        console.log(`   Errors: ${validation.errors.length}`)
        console.log(`   Warnings: ${validation.warnings.length}`)

        if (validation.errors.length > 0) {
            console.log('   Error Details:')
            validation.errors.forEach(error => {
                console.log(`     - ${error.message}`)
            })
        }

        if (validation.warnings.length > 0) {
            console.log('   Warning Details:')
            validation.warnings.forEach(warning => {
                console.log(`     - ${warning.message}`)
            })
        }

        // Clean up
        await artifactService.deleteArtifact(goodArtifact.id)
        console.log('🧹 Example artifact cleaned up')
    } catch (error) {
        console.error('❌ Failed to validate artifact:', error)
    }
}

/**
 * Example 3: Search artifacts
 */
export async function search(): Promise<void> {
    console.log('🔎 Demonstrating search functionality...')

    try {
        // Create some test artifacts
        const artifacts = await Promise.all([
            artifactService.createArtifact({
                name: 'Customer Data Privacy Policy',
                type: ARTIFACT_TYPES.POLICY,
                description:
                    'Comprehensive policy governing the collection, use, and protection of customer data.',
                purpose: 'Ensure compliance with data protection regulations',
                authority: 'Legal Department',
                evaluationCriteria: [
                    'Regulatory compliance',
                    'Risk mitigation',
                ],
            }),
            artifactService.createArtifact({
                name: 'Agile Development Process',
                type: ARTIFACT_TYPES.PROCESS,
                description:
                    'Standardized agile development methodology for software teams.',
                purpose: 'Improve development efficiency and quality',
                authority: 'Engineering Manager',
                evaluationCriteria: ['Delivery speed', 'Quality metrics'],
            }),
            artifactService.createArtifact({
                name: 'Customer Experience Vision',
                type: ARTIFACT_TYPES.VISION,
                description:
                    'Our vision for creating exceptional customer experiences.',
                purpose: 'Guide customer experience improvements',
                authority: 'Customer Experience Team',
                evaluationCriteria: ['Customer satisfaction', 'NPS scores'],
            }),
        ])

        console.log(`✅ Created ${artifacts.length} test artifacts`)

        // Search by text
        console.log('\n🔍 Searching for "customer"...')
        const customerResults = await artifactService.searchArtifacts({
            text: 'customer',
        })
        console.log(
            `   Found ${customerResults.length} artifacts containing "customer"`
        )
        customerResults.forEach(artifact => {
            console.log(`     - ${artifact.name} (${artifact.type})`)
        })

        // Filter by type
        console.log('\n🔍 Filtering for POLICY artifacts...')
        const policyResults = await artifactService.filterArtifacts({
            type: ARTIFACT_TYPES.POLICY,
        })
        console.log(`   Found ${policyResults.length} policy artifacts`)
        policyResults.forEach(artifact => {
            console.log(`     - ${artifact.name}`)
        })

        // Clean up
        for (const artifact of artifacts) {
            await artifactService.deleteArtifact(artifact.id)
        }
        console.log('🧹 Example artifacts cleaned up')
    } catch (error) {
        console.error('❌ Failed to demonstrate search:', error)
    }
}

/**
 * Example 4: Temporal artifacts (drafts)
 */
export async function temporal(): Promise<void> {
    console.log('⏳ Demonstrating temporal artifacts...')

    try {
        // Create a temporal artifact (draft)
        console.log('Creating temporal artifact...')
        const temporal = await artifactService.createTemporalArtifact({
            name: 'Draft Marketing Strategy',
            type: ARTIFACT_TYPES.VISION,
            description: 'Initial draft of our marketing strategy',
            purpose: 'Define marketing approach for next quarter',
        })

        console.log('✅ Temporal artifact created:')
        console.log(`   Temporary ID: ${temporal.temporaryId}`)
        console.log(`   Status: ${temporal.status}`)
        console.log(`   Name: ${temporal.name}`)

        // Update the temporal artifact
        console.log('\nUpdating temporal artifact...')
        const updated = await artifactService.updateTemporalArtifact(
            temporal.temporaryId,
            {
                name: 'Q1 Marketing Strategy',
                description:
                    'Comprehensive marketing strategy for Q1 focusing on digital channels and customer acquisition.',
                purpose: 'Drive customer acquisition and brand awareness in Q1',
                authority: 'Marketing Director',
                evaluationCriteria: [
                    'Lead generation targets',
                    'Brand awareness metrics',
                    'Customer acquisition cost',
                ],
            }
        )

        console.log('✅ Temporal artifact updated:')
        console.log(`   Name: ${updated.name}`)
        console.log(`   Authority: ${updated.authority || 'Not set'}`)

        // Promote to permanent artifact
        console.log('\nPromoting to permanent artifact...')
        const permanent = await artifactService.promoteTemporalArtifact(
            temporal.temporaryId
        )

        console.log('✅ Promoted to permanent artifact:')
        console.log(`   Permanent ID: ${permanent.id}`)
        console.log(`   Name: ${permanent.name}`)
        console.log(`   Type: ${permanent.type}`)

        // Clean up
        await artifactService.deleteArtifact(permanent.id)
        console.log('🧹 Example artifact cleaned up')
    } catch (error) {
        console.error('❌ Failed to demonstrate temporal artifacts:', error)
    }
}

/**
 * Example 5: Service statistics
 */
export async function statistics(): Promise<void> {
    console.log('📊 Demonstrating service statistics...')

    try {
        // Create some test data
        const artifacts = await Promise.all([
            artifactService.createArtifact({
                name: 'Quality Assurance Process',
                type: ARTIFACT_TYPES.PROCESS,
                description: 'Systematic approach to ensuring product quality.',
                purpose: 'Maintain high quality standards',
                authority: 'QA Manager',
                evaluationCriteria: ['Defect rates', 'Testing coverage'],
                semanticMetadata: {
                    semanticTags: ['quality', 'testing'],
                    stakeholders: ['QA Team', 'Development Team'],
                    businessValue: 8,
                },
            }),
            artifactService.createArtifact({
                name: 'Employee Onboarding Procedure',
                type: ARTIFACT_TYPES.PROCEDURE,
                description: 'Step-by-step guide for new employee onboarding.',
                purpose: 'Ensure smooth integration of new team members',
                authority: 'HR Manager',
                evaluationCriteria: [
                    'Time to productivity',
                    'Employee satisfaction',
                ],
                semanticMetadata: {
                    semanticTags: ['hr', 'onboarding'],
                    stakeholders: ['HR Team', 'Managers'],
                    businessValue: 7,
                },
            }),
        ])

        console.log(`✅ Created ${artifacts.length} test artifacts`)

        // Get statistics
        const stats = await artifactService.getStatistics()

        console.log('\n📈 Service Statistics:')
        console.log(`   Total Artifacts: ${stats.totalArtifacts}`)
        console.log(
            `   Average Business Value: ${stats.averageBusinessValue.toFixed(2)}`
        )
        console.log(`   Validation Status:`)
        console.log(`     Valid: ${stats.validationStatus.valid}`)
        console.log(`     Invalid: ${stats.validationStatus.invalid}`)

        console.log(`   Artifacts by Type:`)
        Object.entries(stats.artifactsByType).forEach(([type, count]) => {
            console.log(`     ${type}: ${count}`)
        })

        // Clean up
        for (const artifact of artifacts) {
            await artifactService.deleteArtifact(artifact.id)
        }
        console.log('🧹 Example artifacts cleaned up')
    } catch (error) {
        console.error('❌ Failed to get statistics:', error)
    }
}

/**
 * Run all examples
 */
export async function runAll(): Promise<void> {
    console.log('🚀 Running all examples...\n')

    await createSimple()
    console.log('\n' + '='.repeat(50) + '\n')

    await validate()
    console.log('\n' + '='.repeat(50) + '\n')

    await search()
    console.log('\n' + '='.repeat(50) + '\n')

    await temporal()
    console.log('\n' + '='.repeat(50) + '\n')

    await statistics()

    console.log('\n🎉 All examples completed!')
}

// Export all examples
export const examples = {
    createSimple,
    validate,
    search,
    temporal,
    statistics,
    runAll,
}

export default examples
