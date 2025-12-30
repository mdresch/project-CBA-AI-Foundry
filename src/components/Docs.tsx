import { useTheme } from '../context/useTheme';

function Docs(): JSX.Element {
  const { isDarkTheme } = useTheme();

  return (
    <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">How the LLM and Memory Work</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Short answer</h2>
          <p>
            The model is intentionally stateless — it doesn't persist long-term memory. The application (this app) manages long-term memory (for example using Supabase). The app retrieves the most relevant pieces of history, augments the prompt, and sends them to the model for context. This pattern is called Retrieval-Augmented Generation (RAG).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Why the model is stateless</h2>
          <ul className="list-disc ml-6">
            <li><strong>Scalability:</strong> Stateless services are easier to scale horizontally because each request is independent.</li>
            <li><strong>Robustness:</strong> Decoupling storage from the model reduces single points of failure (e.g., slow DB won't block all model workers).</li>
            <li><strong>Flexibility:</strong> Developers choose storage and retrieval strategies (Supabase, Pinecone, Weaviate, Redis, etc.).</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Retrieval-Augmented Generation (RAG)</h2>
          <p>
            Long histories don't fit in the model's context window. A RAG system stores conversation snippets (often vectorized). When a user asks a question, the app searches the vector store for the most relevant snippets and includes them in the prompt sent to the model. This keeps latency low while preserving useful history.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Recommended architecture</h2>
          <ol className="list-decimal ml-6">
            <li>
              <strong>Store messages and metadata:</strong> Persist raw messages and metadata (user id, timestamp, model used) in a Postgres table (Supabase). Keep the canonical record.
            </li>
            <li>
              <strong>Vectorize and index:</strong> For RAG, embed message snippets and store vectors in a vector index (pgvector on Supabase, Pinecone, Weaviate, or Redis with vector support).
            </li>
            <li>
              <strong>Retrieve then augment:</strong> On new queries, run a semantic search against the vector index for the most relevant snippets, then build an augmented prompt that includes those snippets plus the new user query.
            </li>
            <li>
              <strong>Send to model:</strong> Call the LLM with the augmented prompt. The model remains stateless and processes the combined input.
            </li>
            <li>
              <strong>Persist results:</strong> Save the model's response and any derived metadata (embeddings, citations) back to Postgres and the vector index as needed.
            </li>
          </ol>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Vector DB and tooling options</h2>
          <p>
            Options include pgvector (Supabase), Pinecone, Weaviate, Milvus, and RedisVector. Choose based on cost, latency, and integration needs. For small to medium projects, pgvector on Supabase is convenient because it's colocated with Postgres data and simplifies transactions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Privacy and security considerations</h2>
          <ul className="list-disc ml-6">
            <li>Encrypt sensitive user data at rest and in transit.</li>
            <li>Consider PII redaction before indexing into vectors.</li>
            <li>Use RLS and row-level policies in Supabase to protect per-user data.</li>
            <li>Rotate API keys and restrict access to model and vector services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Closing notes</h2>
          <p>
            This separation of responsibilities (stateless model + application-managed memory) gives you the best of both worlds: a fast, scalable LLM and a customizable, persistent memory layer you control. If you want, this app can be extended with a RAG pipeline that automatically vectorizes new messages and runs semantic retrieval before each model call.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Docs;
