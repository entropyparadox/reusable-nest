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
DB_USERNAME=my-project
DB_PASSWORD=asdf
DB_DATABASE=my-project

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

### Database

1. 다음 명령어를 입력해서 컨테이너 이름은 `pg` 유저는 `postgres` 패스워드는 `asdf` 인 Docker 컨테이너를 실행한다.

```
docker run --name pg -e POSTGRES_PASSWORD=asdf -e POSTGRES_DB=my_project -e POSTGRES_USER=my_project -p 5432:5432 -d postgres
```

2. 다음 명령어를 입력해서 방금 생성한 `pg` 컨테이너에 `psql` 로 접속할 수 있다.

```
docker exec -it pg psql -U postgres
```

3. (Optional) 기타 `psql` 명령어들

   - `create database my_project;` - my_project DB 생성
   - `\l` - 모든 데이터베이스 나열하기
   - `\c my_project` - 이름이 `my_project` 인 데이터베이스에 연결 (특정 데이터베이스에 대해 작업하기 위해 연결함)
   - `\dt` - 연결한 데이터베이스의 모든 테이블 나열하기
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

1. `UsersModule` 에 `AuthModule` 을 추가한다.

```
import { AuthModule } from '@entropyparadox/reusable-nest';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  imports: [
    AuthModule.register(UsersModule, UsersService),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

2. `User` Entity 에서 `AuthUser` 를 상속받는다.

```
import { AuthUser } from '@entropyparadox/reusable-nest';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column } from 'typeorm';

@ObjectType()
@Entity()
export class User extends AuthUser {
  @Field()
  @Column('text', { nullable: false })
  name: string;
}
```

`AuthUser` 의 프로퍼티

- id: number;
- email: string;
- password: string;
- role: string;
- isActive: boolean;
- isAdmin: boolean;
- createdAt: Date;
- updatedAt: Date;

3. `UsersService` 에서 `AuthUsersSerivice` 를 구현한다.

```
import { AuthUsersService } from '@entropyparadox/reusable-nest';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';

@Injectable()
export class UsersService implements AuthUsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  create(createUserInput: CreateUserInput) {
    return this.repository.save(createUserInput);
  }

  findById(id: number) {
    return this.repository.findOne(id);
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }
}
```

4. `UsersResolver` 예시

```
import {
  AuthResponse,
  AuthService,
  CurrentUser,
  GqlLocalAuthGuard,
  Public,
} from '@entropyparadox/reusable-nest';
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly service: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Mutation(() => AuthResponse)
  signup(@Args('input') createUserInput: CreateUserInput) {
    return this.authService.signup(createUserInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  @UseGuards(GqlLocalAuthGuard)
  login(
    @Args('email') email: string,
    @Args('password') password: string,
    @CurrentUser() user: User,
  ) {
    return this.authService.login(user.id);
  }

  @Query(() => [User])
  users() {
    return this.service.findAll();
  }

  @Query(() => User)
  user(@Args('id', { type: () => Int }) id: number) {
    return this.service.findById(id);
  }

  @Query(() => User)
  me(@CurrentUser() user: User) {
    return user;
  }

  @Mutation(() => User)
  updateUser(@Args('input') updateUserInput: UpdateUserInput) {
    return this.service.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.service.remove(id);
  }
}
```
