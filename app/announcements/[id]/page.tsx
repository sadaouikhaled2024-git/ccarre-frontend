import { AnnouncementDetailPageContent } from "@/components/announcement-detail-page-content"

interface AnnouncementDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const { id } = await params

  return <AnnouncementDetailPageContent id={id} />
}
