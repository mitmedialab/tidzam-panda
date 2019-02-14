function generate_id() {
  return str(Date.now() + Math.random().toString().slice(2));
}
