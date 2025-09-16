import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS and logging middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Initialize Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
)

// Create bucket on startup
const bucketName = 'make-3b103978-files'
const { data: buckets } = await supabaseAdmin.storage.listBuckets()
const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
if (!bucketExists) {
  await supabaseAdmin.storage.createBucket(bucketName, { public: false })
}

// Auth helper function
async function getUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return null
  }
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)
  if (error || !user) {
    return null
  }
  return user
}

// Sign up route
app.post('/make-server-3b103978/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Store user profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    })
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup server error:', error)
    return c.json({ error: 'Signup failed' }, 500)
  }
})

// Get files route
app.get('/make-server-3b103978/files', async (c) => {
  try {
    const files = await kv.getByPrefix('file:')
    return c.json({ files: files || [] })
  } catch (error) {
    console.log('Get files error:', error)
    return c.json({ error: 'Failed to fetch files' }, 500)
  }
})

// Upload file route (protected)
app.post('/make-server-3b103978/files', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userProfile = await kv.get(`user:${user.id}`)
    
    const fileData = await c.req.json()
    const fileId = `file:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const file = {
      id: fileId,
      ...fileData,
      authorId: user.id,
      author: userProfile?.name || user.email,
      uploadDate: new Date().toISOString(),
      downloads: 0,
      shared: true,
      approved: true // Auto-approve for now, admin can moderate later
    }
    
    await kv.set(fileId, file)
    
    return c.json({ file })
  } catch (error) {
    console.log('Upload file error:', error)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// Download file route
app.post('/make-server-3b103978/files/:id/download', async (c) => {
  try {
    const fileId = `file:${c.req.param('id').replace('file:', '')}`
    const file = await kv.get(fileId)
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404)
    }
    
    // Increment download count
    file.downloads = (file.downloads || 0) + 1
    await kv.set(fileId, file)
    
    return c.json({ success: true, downloads: file.downloads })
  } catch (error) {
    console.log('Download file error:', error)
    return c.json({ error: 'Failed to update download count' }, 500)
  }
})

// Admin routes
app.get('/make-server-3b103978/admin/files', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userProfile = await kv.get(`user:${user.id}`)
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const files = await kv.getByPrefix('file:')
    return c.json({ files: files || [] })
  } catch (error) {
    console.log('Admin get files error:', error)
    return c.json({ error: 'Failed to fetch files' }, 500)
  }
})

app.post('/make-server-3b103978/admin/files/:id/approve', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userProfile = await kv.get(`user:${user.id}`)
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const fileId = `file:${c.req.param('id').replace('file:', '')}`
    const file = await kv.get(fileId)
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404)
    }
    
    file.approved = true
    await kv.set(fileId, file)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Admin approve file error:', error)
    return c.json({ error: 'Failed to approve file' }, 500)
  }
})

app.delete('/make-server-3b103978/admin/files/:id', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userProfile = await kv.get(`user:${user.id}`)
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const fileId = `file:${c.req.param('id').replace('file:', '')}`
    await kv.del(fileId)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Admin delete file error:', error)
    return c.json({ error: 'Failed to delete file' }, 500)
  }
})

app.get('/make-server-3b103978/admin/users', async (c) => {
  try {
    const user = await getUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userProfile = await kv.get(`user:${user.id}`)
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const users = await kv.getByPrefix('user:')
    return c.json({ users: users || [] })
  } catch (error) {
    console.log('Admin get users error:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Create admin user route (for initial setup)
app.post('/make-server-3b103978/admin/create-admin', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    })
    
    if (error) {
      console.log('Admin creation error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Store admin profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      role: 'admin',
      createdAt: new Date().toISOString()
    })
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Admin creation server error:', error)
    return c.json({ error: 'Admin creation failed' }, 500)
  }
})

Deno.serve(app.fetch)