# reusable-nest

Martian 팀의 NestJS 프로젝트에 재활용 가능한 모듈 및 유틸리티들을 모아둔 라이브러리 입니다.

## Table of Contents

- [Getting Started](#getting-started)
  - [프로젝트 생성](#프로젝트-생성)
  - [Configuration](#configuration)
  - [Database](#database)
- [Authentication](#authentication)

## Getting Started

### 프로젝트 생성

1. GitHub 에 빈 리포지토리를 생성하고 로컬에 클론 받는다.

2. 해당 디렉토리 내에서 nest 프로젝트를 생성한다.

```
$ npm i -g @nestjs/cli
$ nest new .
```

패키지 매니저는 npm 으로

3. `package.json` 파일에서 `name` 의 값을 `api` 로 변경한다.

4. 다음 명령어를 입력해서 `admin` 앱을 추가한다.

```
nest g app admin
```

5. 다음 명령어를 입력해서 `app-library` 라이브러리를 생성한다.

```
nest g library app-library
```

### Configuration

1. 다음 명령어를 입력해 필요한 패키지들을 설치한다.

```
npm i @nestjs/config @nestjs/graphql @nestjs/typeorm apollo-server-express graphql graphql-tools pg typeorm typeorm-naming-strategies
```

2. 프로젝트 루트 경로에 `.env` 와 `.env.example` 파일을 생성하고 둘 다 다음 내용으로 채워준다.

```
# common
PORT=8000
ADMIN_PORT=8001
TZ=UTC

# datasource
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=my_project
DB_PASSWORD=asdf
DB_DATABASE=my_project

# aws
AWS_REGION=ap-northeast-2
AWS_BUCKET=my-project-dev
AWS_ACCESS_KEY=
AWS_SECRET_KEY=

# vimeo
VIMEO_CLIENT_ID=
VIMEO_CLIENT_SECRET=
VIMEO_ACCESS_TOKEN=
```

3. `libs/app-library/src/app-library.module.ts` 파일을 다음과 같이 작성한다.

```
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        namingStrategy: new SnakeNamingStrategy(),
        autoLoadEntities: true,
        synchronize: true,
        // dropSchema: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppLibraryModule {}
```

4. `apps/api/src/main.ts` 파일의 `await app.listen(3000);` 부분을 다음 코드로 교체해준다.

```
await app.listen(process.env.PORT || 8000);
```

`apps/admin/src/main.ts` 파일도 비슷하게 8001 포트로 교체.

```
await app.listen(process.env.ADMIN_PORT || 8001);
```

5. `apps/api/src` 경로에 `resolvers` 폴더를 추가하고, 그 안에 `resolver.module.ts` 파일을 추가해서 다음과 같이 모듈을 만든다. (`admin`도 같은 방식으로 진행)

```
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [],
})
export class ResolversModule {}
```

6. `apps/api/src/app.module.ts` 파일을 다음과 같이 작성한다. (`admin`도 같은 방식으로 진행)

```
import { AppLibraryModule } from '@app/app-library/app-library.module';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ResolversModule } from './resolvers/resolver.module';

@Module({
  imports: [
    AppLibraryModule,
    ResolversModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
    }),
  ],
})
export class AppModule {}
```

7. `.gitignore` 파일에 다음 내용을 추가한다.

```
.env
```

8. 실행 명령어

api 실행

```
nest start --watch
```

admin 실행

```
nest start admin --watch
```

9. resolver 쿼리가 하나도 없으면 실행이 안된다. 임시로 테스트해보려면 `resolvers` 폴더 안에 `my.resolver.ts` 파일을 만든다.

```
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class MyResolver {
  @Query(() => String)
  hi() {
    return 'hi';
  }
}
```

그리고 `resolver.module.ts` 의 providers 에 추가해준다.

```
import { Module } from '@nestjs/common';
import { MyResolver } from './my.resolver';

@Module({
  imports: [],
  providers: [MyResolver],
})
export class ResolversModule {}
```

실행한 후에 [http://localhost:8000/graphql](http://localhost:8000/graphql) 로 접속해서 다음 쿼리를 실행해볼 수 있다. (admin 은 8001 포트)

```
query {
  hi
}
```

### Database

1. 다음 명령어를 입력해서 컨테이너 이름이 `pg` 인 Docker 컨테이너를 실행한다.

유저는 `my_project` 패스워드는 `asdf` 데이터베이스는 `my_project`

```
docker run --name pg -e POSTGRES_USER=my_project -e POSTGRES_PASSWORD=asdf -e POSTGRES_DB=my_project -p 5432:5432 -d postgres
```

2. 다음 명령어를 입력해서 방금 생성한 `pg` 컨테이너에 `psql` 로 접속할 수 있다.

```
docker exec -it pg psql -U my_project
```

3. `psql` 명령어들

   - `\du` - 모든 유저 리스트
   - `CREATE USER my_project WITH PASSWORD 'asdf';` - 이름이 `my_project` 이고 비밀번호가 `asdf` 인 유저 생성
   - `DROP USER my_project;` - 이름이 `my_project` 인 유저 삭제
   - `\l` - 모든 데이터베이스 리스트
   - `CREATE DATABASE my_project;` - 이름이 `my_project` 인 데이터베이스 생성
   - `GRANT ALL PRIVILEGES ON DATABASE my_project TO my_project` - `my_project` 유저에게 `my_project` 데이터베이스 에 접근할 수 있는 권한 부여
   - `\c` - 현재 연결된 데이터베이스 확인
   - `\c my_project` - 이름이 `my_project` 인 데이터베이스에 연결 (특정 데이터베이스에 대해 작업하기 위해 연결함)
   - `\dt` - 연결한 데이터베이스의 모든 테이블 리스트
   - `\q` - `psql` 종료

### reusable-nest 세팅

1. GitHub [Settings](https://github.com/settings/profile) > [Developer settings](https://github.com/settings/apps) > [Personal access tokens](https://github.com/settings/tokens) 에서 Generate new token 버튼을 눌러 토큰을 생성한다. 토큰을 생성할 때 `write:packages` 체크박스를 선택한다. 생성된 토큰을 클립보드에 복사한다.

2. `~/.npmrc` 파일에 다음 내용을 추가한다. `TOKEN` 자리에 복사한 토큰을 넣는다.

```
//npm.pkg.github.com/:_authToken=TOKEN
```

3. 다음 명령어를 입력하여 로그인한다. 로그인할때 패스워드는 복사한 토큰을 그대로 사용한다.

```
npm login --scope=@entropyparadox --registry=https://npm.pkg.github.com
```

4. 다음 명령어를 이용하여 패키지를 설치한다.

```
npm i @entropyparadox/reusable-nest
```

## Authentication

1. `libs/app-library/src` 밑에 `users` 폴더를 만들고 다음과 같이 파일들을 추가한다.

```
users
- user.entity.ts
- users.enum.ts
- users.module.ts
- users.service.ts
```

2. `users.enum.ts` 예시

```
import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'ADMIN',
  BUSINESS = 'BUSINESS',
  USER = 'USER',
}

registerEnumType(Role, { name: 'Role' });
```

`Role` 안에 `ADMIN` 과 `USER` 는 필수

3. `user.entity.ts` 예시

```
import { AuthUser } from '@entropyparadox/reusable-nest';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { Role } from './users.enum';

@ObjectType()
@Entity()
export class User extends AuthUser(Role) {
  @Field()
  @Column('text')
  name: string;
}
```

`AuthUser` 가 제공하는 프로퍼티

- id: number;
- createdAt: Date;
- updatedAt: Date;
- email: string;
- password: string;
- role: Role;

4. `users.service.ts` 예시

```
import { ReusableUsersService } from '@entropyparadox/reusable-nest';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService extends ReusableUsersService(User) {}
```

5. `users.module.ts` 예시

```
import { AuthModule } from '@entropyparadox/reusable-nest';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule.register(UsersModule, UsersService),
  ],
  providers: [UsersService],
  exports: [
    UsersService,
    {
      provide: AuthModule,
      useExisting: AuthModule,
    },
  ],
})
export class UsersModule {}
```

6. `apps/api/src` 폴더에 `dtos` 폴더를 만들고 그 밑에 `users.dto.ts` 파일을 만든다.

```
import { User } from '@app/app-library/users/user.entity';
import { ArgsType, InputType, PartialType, PickType } from '@nestjs/graphql';

@InputType()
export class SignupInput extends PickType(
  User,
  ['email', 'password', 'name',],
  InputType,
) {}

@ArgsType()
export class UpdateMeArgs extends PartialType(
  PickType(User, ['name']),
  ArgsType,
) {}
```

7. `apps/api/src/resolvers` 폴더에 `users.resolver.ts` 파일을 만든다.

```
import { User } from '@app/app-library/users/user.entity';
import { UsersService } from '@app/app-library/users/users.service';
import {
  AuthResponse,
  Public,
  ReusableUsersResolver,
} from '@entropyparadox/reusable-nest';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SignupInput } from '../dtos/users.dto';

@Resolver(() => User)
export class UsersResolver extends ReusableUsersResolver(UsersService, User) {
  @Public()
  @Mutation(() => AuthResponse)
  async signup(@Args('input') input: SignupInput) {
    return this.authService.signup(input);
  }
}
```

8. 마지막 `resolver.module.ts` 파일을 다음과 같이 작성한다.

```
import { UsersModule } from '@app/app-library/users/users.module';
import { ReusableModule } from '@entropyparadox/reusable-nest';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [ReusableModule, UsersModule],
  providers: [UsersResolver],
})
export class ResolversModule {}
```
