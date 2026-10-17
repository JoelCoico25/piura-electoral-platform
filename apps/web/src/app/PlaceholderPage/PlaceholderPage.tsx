const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <section aria-label={title}>
      <h1>{title}</h1>
      <p>Página provisional. Interfaz pendiente de implementación.</p>
    </section>
  )
}

export default PlaceholderPage
