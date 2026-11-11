import { projectsService } from '~/services/projects'

// How many projects are registered, for "Projetos (N)". Fetched once when the page
// opens; the filters don't change it, and a removal updates it locally. Creating a
// project goes back to the list page, which fetches it again.
export function useProjectCount() {
  const count = ref<number | null>(null)
  // without the number the title still works, so a failure just hides it
  const failed = ref(false)

  projectsService().count()
    .then((total) => { count.value = total })
    .catch(() => { failed.value = true })

  function decrement() {
    if (count.value) count.value -= 1
  }

  return { count: readonly(count), failed: readonly(failed), decrement }
}
