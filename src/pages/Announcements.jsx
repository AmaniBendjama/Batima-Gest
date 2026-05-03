import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      setAnnouncements(data || [])
      setLoading(false)
    }
    fetchAnnouncements()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-left text-text-main">Announcements</h1>
      <div className="space-y-4">
        {announcements.map(ann => (
          <Card key={ann.id} title={ann.title}>
            <p className="text-text-secondary mb-2">{ann.content}</p>
            <p className="text-xs text-text-secondary/40">{new Date(ann.created_at).toLocaleDateString()}</p>
          </Card>
        ))}
        {announcements.length === 0 && <p className="text-gray-500 text-left">No announcements yet.</p>}
      </div>
    </div>
  )
}
