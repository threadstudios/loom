import { Loom } from "@threadws/loom-core";
import { LoomGqlPlugin } from "@threadws/loom-graphql";
import { AppModule } from "./app.module";

const app = new Loom({
  modules: [AppModule],
});

app.use(LoomGqlPlugin());

app.listen(3165);
