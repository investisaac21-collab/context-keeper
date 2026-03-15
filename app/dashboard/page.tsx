import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProjectsClient from '@/components/ProjectsClient'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
          redirect('/login')
            }

              const { data: projects } = await supabase
                  .from('projects')
                      .select('*')
                          .order('updated_at', { ascending: false })

                            return (
                                <div className="min-h-screen bg-gray-50">
                                      <Navbar user={session.user} />
                                            <main className="max-w-6xl mx-auto px-4 py-8">
                                                    <ProjectsClient
                                                              initialProjects={projects || []}
                                                                        userId={session.user.id}
                                                                                />
                                                                                      </main>
                                                                                          </div>
                                                                                            )
                                                                                            }