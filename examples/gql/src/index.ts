import { Loom } from "@loom/core";
import { LoomGqlPlugin } from "@loom/graphql";
import { AppModule } from "./app.module";

const app = new Loom({
  modules: [AppModule],
});

app.use(LoomGqlPlugin());

app.listen(3165);
