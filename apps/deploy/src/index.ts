import express from 'express'
import { prisma } from '@aether/database'
import { DeploymentRuntime } from './runtime'

const app = express()
app.use(express.json())

const runtime = new DeploymentRuntime()

app.post('/deploy', async (req, res) => {
  const { projectId } = req.body
  
  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' })
  }

  try {
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        status: 'QUEUED',
        logs: 'Deployment initialized'
      }
    })

    console.log(`Starting deployment for project: ${projectId}, deploymentId: ${deployment.id}`)
    
    // Trigger deployment process asynchronously
    runtime.deploy(deployment.id).catch(err => {
      console.error(`Async deployment failure for ${deployment.id}:`, err)
    })

    res.json({ message: 'Deployment started', deploymentId: deployment.id })
  } catch (error) {
    console.error('Failed to start deployment:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const PORT = 4002
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Deploy engine running on http://0.0.0.0:${PORT}`)
})
